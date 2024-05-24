import { Args, Client, MAINNET_CHAIN_ID } from '@massalabs/massa-web3';
import {
  Button,
  DragDrop,
  formatAmount,
  Spinner,
  toast,
} from '@massalabs/react-ui-kit';
import { useWriteSmartContract } from '@massalabs/react-ui-kit/src/lib/massa-react/hooks/useWriteSmartContract';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../../services/apiClient';
import { useEffect, useMemo, useState } from 'react';
import { AxiosResponse } from 'axios';
import { DownloadZip } from './DownloadZip';
import { FiCheckCircle } from 'react-icons/fi';
import { useAccountStore } from '@massalabs/react-ui-kit/src/lib/ConnectMassaWallets';

interface VerifierProps {
  client: Client | undefined;
  isMainnet: boolean;
  verificationPriceOf?: bigint;
  isPaidVerification?: boolean;
  contractAddressVerifier: string;
  scToInspect: string;
}

interface VerifiedData {
  sourceCodeValid: boolean;
}

export function Verifier(props: VerifierProps) {
  const {
    client,
    isMainnet,
    verificationPriceOf,
    isPaidVerification,
    contractAddressVerifier,
    scToInspect,
  } = props;
  const [connectedAccount, chainId] = useAccountStore((s) => [
    s.connectedAccount,
    s.chainId,
  ]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { callSmartContract, isPending: payIsPending } = useWriteSmartContract(
    client,
    isMainnet,
  );
  const {
    data: dataMutate,
    isError,
    isPending: verifyIsPending,
    mutate,
  } = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('address', scToInspect);
      formData.append(
        'chainIdString',
        chainId ? chainId.toString() : MAINNET_CHAIN_ID.toString(),
      );

      const response = await apiClient.post('/verify', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    },
  });

  const url = useMemo(
    () =>
      `${scToInspect}/verified?chainIdString=${
        chainId ? chainId?.toString() : MAINNET_CHAIN_ID.toString()
      }`,
    [scToInspect, chainId],
  );
  const { data: dataVerified } = useQuery<VerifiedData, undefined>({
    queryKey: [url],
    queryFn: async () => {
      const { data } = await apiClient.get<
        VerifiedData,
        AxiosResponse<VerifiedData>
      >(url);
      return data;
    },
  });

  const isVerified = dataVerified?.sourceCodeValid;

  useEffect(() => {
    if (isError) {
      toast.error('Verification failed');
    }
  }, [isError]);

  useEffect(() => {
    if (dataMutate) {
      console.log('File uploaded successfully:', dataMutate);
      if (dataMutate.sourceCodeValid === false) {
        toast.success('Verification succeeded');
      } else {
        toast.error('Verification failed');
      }
    }
  }, [dataMutate, isError]);

  const handlePayToVerify = () => {
    if (!verificationPriceOf) {
      console.error('scanPriceOf is not defined');
      return;
    }
    if (!scToInspect) {
      console.error('scToInspect is not defined');
      return;
    }
    callSmartContract(
      'pay',
      contractAddressVerifier,
      new Args().addString(scToInspect).serialize(),
      {
        pending: 'Paying to verify...',
        success: 'Paid to verify',
        error: 'Error paying to verify',
      },
      verificationPriceOf,
    );
  };

  const handleVerify = () => {
    if (selectedFile) {
      mutate(selectedFile, {
        onSuccess: (data) => {
          console.log('File uploaded successfully:', data);
        },
        onError: (error) => {
          console.error('Error uploading file:', error);
        },
      });
    }
  };

  let formattedVerificationPriceOf = '...';
  if (verificationPriceOf !== undefined) {
    formattedVerificationPriceOf = formatAmount(
      verificationPriceOf.toString(),
    ).amountFormattedFull;
  }

  return (
    <div className="p-5 flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h2 className="mas-subtitle">Verifier</h2>
        <p>
          The price to verify this smart contract is{' '}
          {formattedVerificationPriceOf} MAS.
        </p>

        <p>
          {!isPaidVerification
            ? 'You have to paid to verify this smart contract.'
            : 'Someone has paid to verify this smart contract.'}
        </p>
        <div>
          {isVerified ? (
            'This smart contract has been verified.'
          ) : (
            <>
              <p>This smart contract has not been verified yet.</p>
              <p>
                Load a zip file with the package.json file at the root and with
                node node_modules nor build folders.
              </p>
            </>
          )}
        </div>
      </div>
      <div>
        {!isVerified && (
          <DragDrop onFileLoaded={setSelectedFile} allowed={['zip']} />
        )}
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-row items-center gap-4">
          <Button
            onClick={handleVerify}
            disabled={!isPaidVerification || !selectedFile || isVerified}
          >
            Verify
            {verifyIsPending && <Spinner />}
          </Button>
          <Button
            onClick={handlePayToVerify}
            disabled={
              isPaidVerification ||
              !verificationPriceOf ||
              !scToInspect ||
              connectedAccount === undefined ||
              payIsPending
            }
          >
            Pay to verify
            {isPaidVerification && <FiCheckCircle />}
            {payIsPending && <Spinner />}
          </Button>
        </div>
        <div className="flex flex-row items-center gap-4">
          <DownloadZip
            scToInspect={scToInspect}
            isPaidVerification={isPaidVerification}
          />
          <Button onClick={() => {}} disabled={!isPaidVerification || true}>
            See proof (soon)
          </Button>
        </div>
      </div>
    </div>
  );
}
