import { Args, fromMAS } from '@massalabs/massa-web3';
import { getClient, waitOp } from './lib';
import { config } from 'dotenv';
config();

const fee = fromMAS('0.01');

const { client } = await getClient(process.env.WALLET_SECRET_KEY!);

for (const contractAddress of [
  process.env.ADDRESS_CONTRACT_SCANNER!,
  process.env.ADDRESS_CONTRACT_VERIFIER!,
]) {
  try {
    let opId = await client.smartContracts().callSmartContract({
      fee,
      targetAddress: contractAddress,
      targetFunction: 'setBytePrice',
      parameter: new Args().addU64(
        contractAddress === process.env.ADDRESS_CONTRACT_SCANNER!
          ? 1_000n
          : 2_000n,
      ),
    });

    console.log(opId);
    await waitOp(client, opId, false);
  } catch (error) {
    console.error(error);
  }
}
