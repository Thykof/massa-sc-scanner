import { Args, fromMAS } from '@massalabs/massa-web3';
import { getClient, waitOp } from './lib';
import { config } from 'dotenv';
config();

const fee = fromMAS('0.01');
const contractAddress = 'AS12wgV3p5i7TEK94en9VoDAt33787MfG8Dtxpqz36DNS3hcGJBKE';

const { client } = await getClient(process.env.WALLET_SECRET_KEY!);

const opId = await client.smartContracts().callSmartContract({
  fee,
  targetAddress: contractAddress,
  targetFunction: 'setBytePrice',
  parameter: new Args().addU64(1_000n),
});

console.log(opId);
await waitOp(client, opId, false);
