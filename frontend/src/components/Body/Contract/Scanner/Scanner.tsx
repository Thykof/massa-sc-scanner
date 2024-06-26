import { Args, Client } from '@massalabs/massa-web3';
import { Button, formatAmount, Spinner, toast } from '@massalabs/react-ui-kit';
import { useWriteSmartContract } from '@massalabs/react-ui-kit/src/lib/massa-react/hooks/useWriteSmartContract';
import { useAccountStore } from '@massalabs/react-ui-kit/src/lib/ConnectMassaWallets';
import { DownloadWasm } from './DownloadWasm';
import { DownloadWat } from './DownloadWat';
import { FiCheckCircle } from 'react-icons/fi';
import { ScanResult } from './ScanResult';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../../services/apiClient';
import { AxiosResponse } from 'axios';
import { useEffect, useMemo } from 'react';

export interface InspectData {
  address: string;
  abis: string[];
  functions: string[];
  name: string;
}

interface ScannerProps {
  client: Client | undefined;
  isMainnet: boolean;
  scanPriceOf?: bigint;
  isPaidScan?: boolean;
  contractAddressScanner: string;
  scToInspect: string;
  refresh: () => void;
}

export function Scanner(props: ScannerProps) {
  const {
    client,
    isMainnet,
    scanPriceOf,
    isPaidScan,
    contractAddressScanner,
    scToInspect,
    refresh,
  } = props;

  const [connectedAccount, chainId] = useAccountStore((s) => [
    s.connectedAccount,
    s.chainId,
  ]);

  const {
    callSmartContract,
    isPending: payIsPending,
    isSuccess: payIsSuccess,
  } = useWriteSmartContract(client, isMainnet);

  useEffect(() => {
    if (payIsSuccess) {
      refresh();
    }
  }, [payIsSuccess, refresh]);

  const url = useMemo(
    () =>
      `/scanner?address=${scToInspect}&chainId=${
        chainId ? chainId?.toString() : import.meta.env.VITE_CHAIN_ID.toString()
      }`,
    [scToInspect, chainId],
  );
  const {
    data: dataInspect,
    refetch: startScan,
    isFetching: scanIsFetching,
  } = useQuery<InspectData, undefined>({
    queryKey: [url],
    queryFn: async () => {
      const { data } = await apiClient.get<
        InspectData,
        AxiosResponse<InspectData>
      >(url);
      return data;
    },
    enabled: false,
  });

  const handlePayToScan = () => {
    if (!scanPriceOf) {
      console.error('scanPriceOf is not defined');
      return;
    }
    callSmartContract(
      'pay',
      contractAddressScanner,
      new Args().addString(scToInspect).serialize(),
      {
        pending: 'Paying to scan...',
        success: 'Paid to scan',
        error: 'Error paying to scan',
      },
      scanPriceOf,
    );
  };

  const handleScan = () => {
    const toastId = toast.loading('Scanning...', {
      duration: Infinity,
    });
    startScan().then(() => {
      toast.dismiss(toastId);
    });
  };

  let formattedScanPriceOf = '...';
  if (scanPriceOf !== undefined) {
    formattedScanPriceOf = formatAmount(
      scanPriceOf.toString(),
    ).amountFormattedFull;
  }

  return (
    <div className="p-5 flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h2 className="mas-subtitle">Scanner</h2>
        <p>
          The price to scan this smart contract is {formattedScanPriceOf} MAS.
        </p>
        <p>
          {!isPaidScan
            ? 'You have to paid to scan this smart contract.'
            : 'Someone has paid to scan this smart contract.'}
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-row items-center gap-4">
          <Button onClick={handleScan} disabled={!isPaidScan || scanIsFetching}>
            Scan
          </Button>
          <Button
            onClick={handlePayToScan}
            disabled={
              isPaidScan ||
              !scanPriceOf ||
              !scToInspect ||
              connectedAccount === undefined ||
              payIsPending
            }
          >
            <span>Pay to scan</span>
            {isPaidScan && <FiCheckCircle />}
            {payIsPending && <Spinner />}
          </Button>
        </div>
        <div className="flex flex-row items-center gap-4">
          <DownloadWasm scToInspect={scToInspect} isPaidScan={isPaidScan} />
          <DownloadWat scToInspect={scToInspect} isPaidScan={isPaidScan} />
        </div>
      </div>
      {dataInspect && !scanIsFetching && (
        <ScanResult dataInspect={dataInspect} />
      )}
    </div>
  );
}
