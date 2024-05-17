import { Args, bytesToU64, byteToBool } from '@massalabs/massa-web3';
import { useCallback, useEffect, useState } from 'react';
import { useClient } from './client';

export function useReadScanner(scToInspect: string, hash: string = 'hash') {
  const { client, contractAddressScanner, contractAddressVerifier } =
    useClient();

  const [bytePriceScan, setBytePriceScan] = useState<bigint>();
  const [scanPriceOf, setScanPriceOf] = useState<bigint>();
  const [isPaidScan, setIsPaidScan] = useState<boolean>();
  const [bytePriceVerification, setBytePriceVerification] = useState<bigint>();
  const [verificationPriceOf, setVerificationPriceOf] = useState<bigint>();
  const [isPaidVerification, setIsPaidVerification] = useState<boolean>();

  const readBytePriceScan = useCallback(async () => {
    const callData = {
      targetAddress: contractAddressScanner,
      parameter: [],
    };
    if (!client) {
      return Promise.resolve(undefined);
    }
    const readOnlyResult = await client
      .smartContracts()
      .readSmartContract({ ...callData, targetFunction: 'bytePrice' });
    return bytesToU64(readOnlyResult.returnValue);
  }, [client, contractAddressScanner]);

  const readScanPriceOf = useCallback(async () => {
    const callData = {
      targetAddress: contractAddressScanner,
      parameter: new Args().addString(scToInspect),
    };
    if (!client) {
      return Promise.resolve(undefined);
    }
    const readOnlyResult = await client
      .smartContracts()
      .readSmartContract({ ...callData, targetFunction: 'priceOf' });
    return bytesToU64(readOnlyResult.returnValue);
  }, [client, contractAddressScanner, scToInspect]);

  const readIsPaidScan = useCallback(async () => {
    const callData = {
      targetAddress: contractAddressScanner,
      parameter: new Args().addString(scToInspect),
    };
    if (!client) {
      return Promise.resolve(undefined);
    }
    const readOnlyResult = await client
      .smartContracts()
      .readSmartContract({ ...callData, targetFunction: 'isPaid' });
    return byteToBool(readOnlyResult.returnValue);
  }, [client, contractAddressScanner, scToInspect]);

  const readBytePriceVerification = useCallback(async () => {
    const callData = {
      targetAddress: contractAddressVerifier,
      parameter: [],
    };
    if (!client) {
      return Promise.resolve(undefined);
    }
    const readOnlyResult = await client.smartContracts().readSmartContract({
      ...callData,
      targetFunction: 'bytePrice',
    });
    return bytesToU64(readOnlyResult.returnValue);
  }, [client, contractAddressVerifier]);

  const readVerificationPriceOf = useCallback(async () => {
    const callData = {
      targetAddress: contractAddressVerifier,
      parameter: new Args().addString(scToInspect).addString(hash),
    };
    if (!client) {
      return Promise.resolve(undefined);
    }
    const readOnlyResult = await client
      .smartContracts()
      .readSmartContract({ ...callData, targetFunction: 'priceOf' });
    return bytesToU64(readOnlyResult.returnValue);
  }, [client, contractAddressVerifier, scToInspect, hash]);

  const readIsPaidVerification = useCallback(async () => {
    const callData = {
      targetAddress: contractAddressVerifier,
      parameter: new Args().addString(scToInspect).addString(hash),
    };
    if (!client) {
      return Promise.resolve(undefined);
    }
    const readOnlyResult = await client
      .smartContracts()
      .readSmartContract({ ...callData, targetFunction: 'isPaid' });
    return byteToBool(readOnlyResult.returnValue);
  }, [client, contractAddressVerifier, scToInspect, hash]);

  const readGetWasm = useCallback(async () => {
    const callData = {
      targetAddress: contractAddressScanner,
      parameter: new Args().addString(scToInspect),
    };
    if (!client) {
      return Promise.resolve(undefined);
    }
    const readOnlyResult = await client
      .smartContracts()
      .readSmartContract({ ...callData, targetFunction: 'getWasm' });
    return readOnlyResult.returnValue;
  }, [client, contractAddressScanner, scToInspect]);

  useEffect(() => {
    readBytePriceScan().then(setBytePriceScan);
    readBytePriceVerification().then(setBytePriceVerification);
    if (scToInspect.startsWith('AS')) {
      readScanPriceOf().then(setScanPriceOf);

      readIsPaidScan().then(setIsPaidScan);
      readVerificationPriceOf().then(setVerificationPriceOf);
      if (hash) {
        readIsPaidVerification().then(setIsPaidVerification);
      }
    }
  }, [
    readBytePriceScan,
    readScanPriceOf,
    readIsPaidScan,
    readBytePriceVerification,
    readVerificationPriceOf,
    readIsPaidVerification,
    scToInspect,
    hash,
  ]);

  return {
    bytePriceScan,
    scanPriceOf,
    isPaidScan,
    bytePriceVerification,
    verificationPriceOf,
    isPaidVerification,
    readGetWasm,
  };
}
