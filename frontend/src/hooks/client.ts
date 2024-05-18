import {
  BUILDNET_CHAIN_ID,
  Client,
  ClientFactory,
  DefaultProviderUrls,
  MAINNET_CHAIN_ID,
} from '@massalabs/massa-web3';
import { useAccountStore } from '@massalabs/react-ui-kit/src/lib/ConnectMassaWallets/store';
import { useEffect, useState } from 'react';

export function useClient() {
  const { massaClient, chainId } = useAccountStore();
  const [publicClient, setPublicClient] = useState<Client>();

  const isMainnet =
    chainId === undefined
      ? import.meta.env.VITE_CHAIN_ID === MAINNET_CHAIN_ID.toString()
      : chainId === MAINNET_CHAIN_ID;

  useEffect(() => {
    isMainnet
      ? ClientFactory.createDefaultClient(
          DefaultProviderUrls.MAINNET,
          MAINNET_CHAIN_ID,
        ).then(setPublicClient)
      : ClientFactory.createDefaultClient(
          DefaultProviderUrls.BUILDNET,
          BUILDNET_CHAIN_ID,
        ).then(setPublicClient);
  }, [isMainnet]);

  const contractAddressScanner = isMainnet
    ? import.meta.env.VITE_SC_ADDRESS_SCANNER_MAINNET
    : import.meta.env.VITE_SC_ADDRESS_SCANNER_BUILDNET;
  const contractAddressVerifier = isMainnet
    ? import.meta.env.VITE_SC_ADDRESS_VERIFIER_MAINNET
    : import.meta.env.VITE_SC_ADDRESS_VERIFIER_BUILDNET;

  return {
    client: massaClient || publicClient,
    isMainnet,
    contractAddressScanner,
    contractAddressVerifier,
  };
}
