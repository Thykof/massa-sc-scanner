import { Args, fromMAS, MAX_GAS_CALL } from '@massalabs/massa-web3';
import { writeFileSync } from 'fs';
import { getClient, waitOp } from './lib';
import { config } from 'dotenv';
config();

const fee = fromMAS('0.01');
const contractAddress = 'AS12duKkopjrnCG6L8cJkkh2Pax14aGATvihA9dqiz9d27EhhTXN2';
const targetAddress = 'AS1uhFrx6fJzbQKQPfda7ucPvSuVqUbRgN9NTeaBbo1vJy5urNHB'; // buildnet FT token test

const { client } = await getClient(process.env.WALLET_SECRET_KEY!);

const callData = {
  fee,
  targetAddress: contractAddress,
  targetFunction: 'bytecodeOf',
  parameter: new Args().addString(targetAddress),
};

let readOnlyResult = await client.smartContracts().readSmartContract(callData);

if (readOnlyResult.returnValue.length > 0) {
  console.log('already paid');
  writeFileSync(`build/${targetAddress}.wasm`, readOnlyResult.returnValue);
  process.exit(0);
}

const priceEvent = readOnlyResult.info.output_events[0].data;
const price = BigInt(priceEvent.split('price:')[1]);
console.log('price:', price);

const opId = await client.smartContracts().callSmartContract({
  maxGas: MAX_GAS_CALL,
  coins: price,
  ...callData,
});

console.log(opId);
await waitOp(client, opId, false);

readOnlyResult = await client.smartContracts().readSmartContract(callData);

if (readOnlyResult.returnValue.length > 0) {
  console.log('paid');
  writeFileSync(`build/${targetAddress}.wasm`, readOnlyResult.returnValue);
}
