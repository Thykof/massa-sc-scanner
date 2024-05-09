import { Args, fromMAS } from '@massalabs/massa-web3';
import { getClient, waitOp } from './lib';
import { config } from 'dotenv';
config();

const fee = fromMAS('0.01');
const contractAddress = 'AS12duKkopjrnCG6L8cJkkh2Pax14aGATvihA9dqiz9d27EhhTXN2';

const { client } = await getClient(process.env.WALLET_SECRET_KEY!);

const opId = await client.smartContracts().callSmartContract({
  fee,
  targetAddress: contractAddress,
  targetFunction: 'setBytePrice',
  parameter: new Args().addU64(1_000n),
});

console.log(opId);
await waitOp(client, opId, false);
