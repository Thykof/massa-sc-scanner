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

  useEffect(() => {
    import.meta.env.VITE_CHAIN_ID
      ? ClientFactory.createDefaultClient(
          DefaultProviderUrls.BUILDNET,
          BUILDNET_CHAIN_ID,
        ).then(setPublicClient)
      : ClientFactory.createDefaultClient(
          DefaultProviderUrls.MAINNET,
          MAINNET_CHAIN_ID,
        ).then(setPublicClient);
  }, []);

  const isMainnet =
    chainId === undefined
      ? import.meta.env.VITE_CHAIN_ID === MAINNET_CHAIN_ID.toString()
      : chainId === MAINNET_CHAIN_ID;

  const contractAddressScanner = isMainnet
    ? import.meta.env.VITE_SC_ADDRESS_SCANNER_MAINNET
    : import.meta.env.VITE_SC_ADDRESS_SCANNER_BUILDNER;
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
