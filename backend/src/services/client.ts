import {
  Args,
  byteToBool,
  BUILDNET_CHAIN_ID,
  Client,
  ClientFactory,
  DefaultProviderUrls,
  MAINNET_CHAIN_ID,
} from '@massalabs/massa-web3';

export async function initClient(chainId: bigint): Promise<{
  client: Client;
  scannerAddress: string;
  verifierAddress: string;
}> {
  if (chainId === MAINNET_CHAIN_ID) {
    return {
      client: await ClientFactory.createDefaultClient(
        DefaultProviderUrls.MAINNET,
        MAINNET_CHAIN_ID,
      ),
      scannerAddress: process.env.SC_ADDRESS_SCANNER_MAINNET,
      verifierAddress: process.env.SC_ADDRESS_VERIFIER_MAINNET,
    };
  } else {
    return {
      client: await ClientFactory.createDefaultClient(
        DefaultProviderUrls.BUILDNET,
        BUILDNET_CHAIN_ID,
      ),
      scannerAddress: process.env.SC_ADDRESS_SCANNER_BUILDNET,
      verifierAddress: process.env.SC_ADDRESS_VERIFIER_BUILDNET,
    };
  }
}

export async function address2wasm(
  client: Client,
  targetAddress: string,
  address: string,
): Promise<Uint8Array> {
  const readOnlyResult = await client.smartContracts().readSmartContract({
    targetAddress: targetAddress,
    targetFunction: 'getWasm',
    parameter: new Args().addString(address).serialize(),
  });
  if (readOnlyResult.returnValue.length === 0) {
    throw new Error('Empty bytecode');
  }

  return readOnlyResult.returnValue;
}

export async function isPaid(
  client: Client,
  targetAddress: string,
  address: string,
): Promise<boolean> {
  const callData = {
    targetAddress: targetAddress,
    parameter: new Args().addString(address),
  };
  const readOnlyResult = await client
    .smartContracts()
    .readSmartContract({ ...callData, targetFunction: 'isPaid' });
  return byteToBool(readOnlyResult.returnValue);
}
