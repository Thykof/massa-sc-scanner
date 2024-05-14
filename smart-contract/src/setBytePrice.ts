import { Args, fromMAS } from '@massalabs/massa-web3';
import { getClient, waitOp } from './lib';
import { config } from 'dotenv';
config();

const fee = fromMAS('0.01');
const contractAddress = process.env.ADDRESS_CONTRACT!;

const { client } = await getClient(process.env.WALLET_SECRET_KEY!);

let opId = await client.smartContracts().callSmartContract({
  fee,
  targetAddress: contractAddress,
  targetFunction: 'setScanBytePrice',
  parameter: new Args().addU64(1_000n),
});

console.log(opId);
await waitOp(client, opId, false);

opId = await client.smartContracts().callSmartContract({
  fee,
  targetAddress: contractAddress,
  targetFunction: 'setVerificationBytePrice',
  parameter: new Args().addU64(2_000n),
});

console.log(opId);
await waitOp(client, opId, false);
