import { Args, bytesToU64, byteToBool } from '@massalabs/massa-web3';
import { useCallback, useEffect, useState } from 'react';
import { useClient } from './client';

export function useReadGlobal() {
  const { client, contractAddressScanner, contractAddressVerifier } =
    useClient();

  const [bytePriceScan, setBytePriceScan] = useState<bigint>();
  const [bytePriceVerification, setBytePriceVerification] = useState<bigint>();

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

  useEffect(() => {
    readBytePriceScan().then((result) => {
      setBytePriceScan(result);
    });
    readBytePriceVerification().then((result) => {
      setBytePriceVerification(result);
    });
  }, [readBytePriceScan, readBytePriceVerification]);

  return {
    bytePriceScan,
    bytePriceVerification,
  };
}

export function useReadScanner(scToInspect: string) {
  const { client, contractAddressScanner, contractAddressVerifier } =
    useClient();

  const [scanPriceOf, setScanPriceOf] = useState<bigint>();
  const [isPaidScan, setIsPaidScan] = useState<boolean>();
  const [verificationPriceOf, setVerificationPriceOf] = useState<bigint>();
  const [isPaidVerification, setIsPaidVerification] = useState<boolean>();
  const [error, setError] = useState<boolean>();

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

  const readVerificationPriceOf = useCallback(async () => {
    const callData = {
      targetAddress: contractAddressVerifier,
      parameter: new Args().addString(scToInspect),
    };
    if (!client) {
      return Promise.resolve(undefined);
    }
    const readOnlyResult = await client
      .smartContracts()
      .readSmartContract({ ...callData, targetFunction: 'priceOf' });
    return bytesToU64(readOnlyResult.returnValue);
  }, [client, contractAddressVerifier, scToInspect]);

  const readIsPaidVerification = useCallback(async () => {
    console.log('contractAddressVerifier', contractAddressVerifier);
    console.log('scToInspect', scToInspect);
    const callData = {
      targetAddress: contractAddressVerifier,
      parameter: new Args().addString(scToInspect),
    };
    if (!client) {
      return Promise.resolve(undefined);
    }
    const readOnlyResult = await client
      .smartContracts()
      .readSmartContract({ ...callData, targetFunction: 'isPaid' });
    return byteToBool(readOnlyResult.returnValue);
  }, [client, contractAddressVerifier, scToInspect]);

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
    if (scToInspect.startsWith('AS')) {
      readScanPriceOf()
        .then((result) => {
          setScanPriceOf(result);
          setError(false);
        })
        .catch(() => setError(true));
      readIsPaidScan()
        .then((result) => {
          setIsPaidScan(result);
          setError(false);
        })
        .catch(() => setError(true));
      readVerificationPriceOf()
        .then((result) => {
          setVerificationPriceOf(result);
          setError(false);
        })
        .catch(() => setError(true));
      readIsPaidVerification()
        .then((result) => {
          setIsPaidVerification(result);
          setError(false);
        })
        .catch(() => setError(true));
    }
  }, [
    readScanPriceOf,
    readIsPaidScan,
    readVerificationPriceOf,
    readIsPaidVerification,
    scToInspect,
  ]);

  return {
    scanPriceOf,
    isPaidScan,
    verificationPriceOf,
    isPaidVerification,
    readGetWasm,
    error,
  };
}
