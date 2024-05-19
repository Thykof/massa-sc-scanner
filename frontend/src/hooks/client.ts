import {
  BUILDNET_CHAIN_ID,
  Client,
  ClientFactory,
  DefaultProviderUrls,
  MAINNET_CHAIN_ID,
} from '@massalabs/massa-web3';
import { useAccountStore } from '@massalabs/react-ui-kit/src/lib/ConnectMassaWallets/store';
import { useEffect, useMemo, useState } from 'react';

export function useClient() {
  const { massaClient, chainId } = useAccountStore();
  const [publicClient, setPublicClient] = useState<Client>();
  const defaultIsMainnet = useMemo(
    () => import.meta.env.VITE_CHAIN_ID === MAINNET_CHAIN_ID.toString(),
    [],
  );
  const [isMainnet, setIsMainnet] = useState<boolean>(defaultIsMainnet);

  const [contractAddressScanner, setContractAddressScanner] = useState<string>(
    defaultIsMainnet
      ? import.meta.env.VITE_SC_ADDRESS_SCANNER_MAINNET
      : import.meta.env.VITE_SC_ADDRESS_SCANNER_BUILDNET,
  );
  const [contractAddressVerifier, setContractAddressVerifier] =
    useState<string>(
      defaultIsMainnet
        ? import.meta.env.VITE_SC_ADDRESS_VERIFIER_MAINNET
        : import.meta.env.VITE_SC_ADDRESS_VERIFIER_BUILDNET,
    );

  useEffect(() => {
    const isMainnet =
      chainId === undefined
        ? import.meta.env.VITE_CHAIN_ID === MAINNET_CHAIN_ID.toString()
        : chainId === MAINNET_CHAIN_ID;
    setIsMainnet(isMainnet);
    isMainnet
      ? ClientFactory.createDefaultClient(
          DefaultProviderUrls.MAINNET,
          MAINNET_CHAIN_ID,
        ).then((client) => {
          setPublicClient(client);
          setContractAddressScanner(
            import.meta.env.VITE_SC_ADDRESS_SCANNER_MAINNET,
          );
          setContractAddressVerifier(
            import.meta.env.VITE_SC_ADDRESS_VERIFIER_MAINNET,
          );
        })
      : ClientFactory.createDefaultClient(
          DefaultProviderUrls.BUILDNET,
          BUILDNET_CHAIN_ID,
        ).then((client) => {
          setPublicClient(client);
          setContractAddressScanner(
            import.meta.env.VITE_SC_ADDRESS_SCANNER_BUILDNET,
          );
          setContractAddressVerifier(
            import.meta.env.VITE_SC_ADDRESS_VERIFIER_BUILDNET,
          );
        });
  }, [chainId]);

  return {
    client: massaClient || publicClient,
    isMainnet,
    contractAddressScanner,
    contractAddressVerifier,
  };
}
