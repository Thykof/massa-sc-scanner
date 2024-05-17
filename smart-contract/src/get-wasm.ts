import { Args, fromMAS } from '@massalabs/massa-web3';
import { writeFileSync } from 'fs';
import { getClient } from './lib';
import { config } from 'dotenv';
config();

const fee = fromMAS('0.01');
const targetAddress = 'AS1dTb8iM9ED2adV6a26BMjg3sYQywiyLn33nJTRZ2fiY7FtRGSA'; // scan and verify paid
// AS12S5taMtYjQgSMTK574feb2zEzXCM4XRmQmLGR4Gp88A5dTtcdR not paid

const { client } = await getClient(process.env.WALLET_SECRET_KEY!);

let i = 0;
for (const contractAddress of [
  process.env.ADDRESS_CONTRACT_SCANNER!,
  process.env.ADDRESS_CONTRACT_VERIFIER!,
]) {
  try {
    const args = new Args().addString(targetAddress);
    if (contractAddress === process.env.ADDRESS_CONTRACT_VERIFIER!) {
      args.addString('hash');
    }
    const callData = {
      fee,
      targetAddress: contractAddress,
      targetFunction: 'getWasm',
      parameter: args.serialize(),
    };

    let readOnlyResult = await client
      .smartContracts()
      .readSmartContract(callData);

    if (readOnlyResult.returnValue.length > 0) {
      console.log('writing file');
      writeFileSync(
        `build/${targetAddress}-${i}.wasm`,
        readOnlyResult.returnValue,
      );
    }

    i++;
  } catch (error) {
    i++;
    console.error(error);
  }
}
