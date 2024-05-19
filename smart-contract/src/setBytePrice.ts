import { Args, fromMAS, MAINNET_CHAIN_ID } from '@massalabs/massa-web3';
import { getClient, waitOp, WaitOpResult } from './lib';
import { config } from 'dotenv';
config();

const { client, chainId } = await getClient(process.env.WALLET_SECRET_KEY!);

const isMainnet = chainId === MAINNET_CHAIN_ID;

const fee = isMainnet ? 0n : fromMAS('0.01');

const promises: Promise<WaitOpResult>[] = [];

for (const contractAddress of [
  process.env.ADDRESS_CONTRACT_SCANNER!,
  process.env.ADDRESS_CONTRACT_VERIFIER!,
]) {
  let price: bigint = fromMAS('100'); // pause
  // let price: bigint = 0n; // admin
  if (contractAddress === process.env.ADDRESS_CONTRACT_SCANNER!) {
    price = isMainnet ? fromMAS('0.005') : 100n;
  } else {
    price = isMainnet ? fromMAS('0.1') : 3_000n;
  }
  try {
    let opId = await client.smartContracts().callSmartContract({
      fee,
      targetAddress: contractAddress,
      targetFunction: 'setBytePrice',
      parameter: new Args().addU64(price),
    });

    console.log(`Operation ID: ${opId}`);
    promises.push(waitOp(client, opId, false));
  } catch (error) {
    console.error(error);
  }
}

Promise.all(promises).then((results) => {
  console.log(results);
  process.exit(0);
});
