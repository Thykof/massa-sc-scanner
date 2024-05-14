import { Args, fromMAS } from '@massalabs/massa-web3';
import { writeFileSync } from 'fs';
import { getClient } from './lib';
import { config } from 'dotenv';
config();

const fee = fromMAS('0.01');
const contractAddress = process.env.ADDRESS_CONTRACT!;
const targetAddress = 'AS1dTb8iM9ED2adV6a26BMjg3sYQywiyLn33nJTRZ2fiY7FtRGSA';

const { client } = await getClient(process.env.WALLET_SECRET_KEY!);

const callData = {
  fee,
  targetAddress: contractAddress,
  targetFunction: 'getWasm',
  parameter: new Args().addString(targetAddress),
};

let readOnlyResult = await client.smartContracts().readSmartContract(callData);

if (readOnlyResult.returnValue.length > 0) {
  console.log('writing file');
  writeFileSync(`build/${targetAddress}.wasm`, readOnlyResult.returnValue);
  process.exit(0);
}
