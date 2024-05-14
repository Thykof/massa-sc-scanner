import { Args, bytesToU64, byteToBool, fromMAS } from '@massalabs/massa-web3';
import { getClient, waitOp } from './lib';
import { config } from 'dotenv';
config();

const fee = fromMAS('0.01');
const contractAddress = process.env.ADDRESS_CONTRACT!;
const targetAddress = 'AS1dTb8iM9ED2adV6a26BMjg3sYQywiyLn33nJTRZ2fiY7FtRGSA'; // buildnet FT token

const { client } = await getClient(process.env.WALLET_SECRET_KEY!);

const callData = {
  fee,
  targetAddress: contractAddress,
  parameter: new Args().addString(targetAddress),
};

let readOnlyResult = await client
  .smartContracts()
  .readSmartContract({ ...callData, targetFunction: 'bytePriceVerification' });
console.log('bytePriceVerification:', bytesToU64(readOnlyResult.returnValue));

readOnlyResult = await client
  .smartContracts()
  .readSmartContract({ ...callData, targetFunction: 'verificationPriceOf' });
const price = bytesToU64(readOnlyResult.returnValue);
console.log('price:', price);

const opId = await client.smartContracts().callSmartContract({
  ...callData,
  targetFunction: 'payVerification',
  coins: price,
});
console.log(opId);
await waitOp(client, opId, false);

readOnlyResult = await client
  .smartContracts()
  .readSmartContract({ ...callData, targetFunction: 'isPaidVerification' });
console.log('isPaidVerification:', byteToBool(readOnlyResult.returnValue));
