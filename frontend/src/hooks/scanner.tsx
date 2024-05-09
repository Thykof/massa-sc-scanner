import { useState } from 'react';
import {
  Client,
  EOperationStatus,
  ICallData,
  MAX_GAS_CALL,
} from '@massalabs/massa-web3';
import { ToastContent, toast } from '@massalabs/react-ui-kit';
import { OperationToast } from '../lib/ConnectMassaWallets/components/OperationToast';
import { logSmartContractEvents } from '../lib/ConnectMassaWallets/utils';
import Intl from '../lib/ConnectMassaWallets/i18n/i18n';
import { ToasterMessage } from '../lib/ConnectMassaWallets/hooks/write-sc';

export function useWriteSmartContract(client?: Client, isMainnet?: boolean) {
  const [isPending, setIsPending] = useState(false);
  const [isOpPending, setIsOpPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [opId, setOpId] = useState<string | undefined>(undefined);

  async function callSmartContract(
    targetFunction: string,
    targetAddress: string,
    parameter: number[],
    messages: ToasterMessage,
  ): Promise<Uint8Array> {
    if (!client) {
      throw new Error('Massa client not found');
    }
    if (isOpPending) {
      throw new Error('Operation is already pending');
    }
    setIsSuccess(false);
    setIsError(false);
    setIsOpPending(false);
    setIsPending(true);
    let opId: string | undefined;
    let toastId: string | undefined;

    const callData = {
      targetAddress,
      targetFunction,
      parameter,
    } as ICallData;

    try {
      let readOnlyResult = await client
        .smartContracts()
        .readSmartContract(callData);
      if (readOnlyResult.returnValue.length > 0) {
        console.log('already paid');
        return readOnlyResult.returnValue;
      }
      const priceEvent = readOnlyResult.info.output_events[0].data;
      const price = BigInt(priceEvent.split('price:')[1]);
      const opId = await client
        .smartContracts()
        .callSmartContract({ ...callData, coins: price, maxGas: MAX_GAS_CALL }); // TODO: optimize maxGas
      setOpId(opId);
      setIsOpPending(true);
      toastId = toast.loading(
        (t) => (
          <ToastContent t={t}>
            <OperationToast
              isMainnet={isMainnet}
              title={messages.pending}
              operationId={opId}
            />
          </ToastContent>
        ),
        {
          duration: Infinity,
        },
      );
      const status = await client
        .smartContracts()
        .awaitMultipleRequiredOperationStatus(opId, [
          EOperationStatus.SPECULATIVE_ERROR,
          EOperationStatus.FINAL_ERROR,
          EOperationStatus.FINAL_SUCCESS,
        ]);
      if (status !== EOperationStatus.FINAL_SUCCESS) {
        throw new Error('Operation failed', { cause: { status } });
      }
      setIsSuccess(true);
      setIsOpPending(false);
      setIsPending(false);
      toast.dismiss(toastId);
      toast.success((t) => (
        <ToastContent t={t}>
          <OperationToast
            isMainnet={isMainnet}
            title={messages.success}
            operationId={opId}
          />
        </ToastContent>
      ));
      readOnlyResult = await client
        .smartContracts()
        .readSmartContract(callData);
      if (readOnlyResult.returnValue.length === 0) {
        throw new Error('no bytecode returned');
      }
      return readOnlyResult.returnValue;
    } catch (error) {
      console.error(error);
      toast.dismiss(toastId);
      setIsError(true);
      setIsOpPending(false);
      setIsPending(false);

      if (!opId) {
        console.error('Operation ID not found');
        toast.error((t) => (
          <ToastContent t={t}>
            <OperationToast isMainnet={isMainnet} title={messages.error} />
          </ToastContent>
        ));
        throw error;
      }

      if (
        [
          EOperationStatus.FINAL_ERROR,
          EOperationStatus.SPECULATIVE_ERROR,
        ].includes((error as { cause: { status: number } }).cause?.status)
      ) {
        toast.error((t) => (
          <ToastContent t={t}>
            <OperationToast
              isMainnet={isMainnet}
              title={messages.error}
              operationId={opId}
            />
          </ToastContent>
        ));
        logSmartContractEvents(client, opId);
      } else {
        toast.error((t) => (
          <ToastContent t={t}>
            <OperationToast
              isMainnet={isMainnet}
              title={
                messages.timeout || Intl.t('send-coins.steps.failed-timeout')
              }
              operationId={opId}
            />
          </ToastContent>
        ));
      }
      throw error;
    }
  }

  return {
    opId,
    isOpPending,
    isPending,
    isSuccess,
    isError,
    callSmartContract,
  };
}
