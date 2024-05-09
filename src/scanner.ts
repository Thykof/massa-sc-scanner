import { Args, fromMAS, MAX_GAS_CALL } from '@massalabs/massa-web3';
import { writeFileSync } from 'fs';
import { getClient, waitOp } from './lib';
import { config } from 'dotenv';
config();

const fee = fromMAS('0.01');
const contractAddress = 'AS12fFjYBSuwAgCeChX3QXq3rMQiaKngsFgqmjRHwPryAtZ7ULQnq';
const targetAddress = 'AS1uhFrx6fJzbQKQPfda7ucPvSuVqUbRgN9NTeaBbo1vJy5urNHB'; // buildnet FT token test

const { client } = await getClient(process.env.WALLET_SECRET_KEY!);

const callData = {
  fee,
  targetAddress: contractAddress,
  targetFunction: 'bytecodeOf',
  parameter: new Args().addString(targetAddress),
};

const readOnlyResult = await client
  .smartContracts()
  .readSmartContract(callData);

if (readOnlyResult.returnValue.length > 0) {
  throw new Error('ERROR: must not provide the bytecode for a readonly call');
}

const priceEvent = readOnlyResult.info.output_events[0].data;
const price = BigInt(priceEvent.split('price:')[1]);
console.log('price:', price);

// process.exit(0);

const opId = await client.smartContracts().callSmartContract({
  maxGas: MAX_GAS_CALL,
  // coins: price, // admin don't pay
  ...callData,
});

console.log(opId);
const { events } = await waitOp(client, opId, false);
// Runtime error: Event data size is too large
const bytecodeEvent = events.find((e) => e.data.includes('bytecode:'));
const bytecode = bytecodeEvent!.data.split('bytecode:')[1];
writeFileSync(`build/${targetAddress}.wasm`, bytecode);
