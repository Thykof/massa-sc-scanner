import { Args, bytesToU64, byteToBool, Client } from '@massalabs/massa-web3';
import { buildnetAddress, mainnetAddress } from '../const/addresses';
import { useCallback, useEffect, useState } from 'react';

export function useReadScanner(
  scToInspect: string,
  client?: Client,
  isMainnet?: boolean,
) {
  const contractAddress = isMainnet ? mainnetAddress : buildnetAddress;

  const [bytePriceScan, setBytePriceScan] = useState<bigint>();
  const [scanPriceOf, setScanPriceOf] = useState<bigint>();
  const [isPaidScan, setIsPaidScan] = useState<boolean>();
  const [bytePriceVerification, setBytePriceVerification] = useState<bigint>();
  const [verificationPriceOf, setVerificationPriceOf] = useState<bigint>();
  const [isPaidVerification, setIsPaidVerification] = useState<boolean>();

  const readBytePriceScan = useCallback(() => {
    const callData = {
      targetAddress: contractAddress,
      parameter: [],
    };
    if (!client) {
      return Promise.resolve(undefined);
    }
    return client
      .smartContracts()
      .readSmartContract({ ...callData, targetFunction: 'bytePriceScan' })
      .then((readOnlyResult) => {
        return bytesToU64(readOnlyResult.returnValue);
      });
  }, [client, contractAddress]);

  const readScanPriceOf = useCallback(() => {
    const callData = {
      targetAddress: contractAddress,
      parameter: new Args().addString(scToInspect),
    };
    if (!client) {
      return Promise.resolve(undefined);
    }
    return client
      .smartContracts()
      .readSmartContract({ ...callData, targetFunction: 'scanPriceOf' })
      .then((readOnlyResult) => {
        return bytesToU64(readOnlyResult.returnValue);
      });
  }, [client, contractAddress, scToInspect]);

  const readIsPaidScan = useCallback(() => {
    const callData = {
      targetAddress: contractAddress,
      parameter: new Args().addString(scToInspect),
    };
    if (!client) {
      return Promise.resolve(undefined);
    }
    return client
      .smartContracts()
      .readSmartContract({ ...callData, targetFunction: 'isPaidScan' })
      .then((readOnlyResult) => {
        return byteToBool(readOnlyResult.returnValue);
      });
  }, [client, contractAddress, scToInspect]);

  const readBytePriceVerification = useCallback(() => {
    const callData = {
      targetAddress: contractAddress,
      parameter: [],
    };
    if (!client) {
      return Promise.resolve(undefined);
    }
    return client
      .smartContracts()
      .readSmartContract({
        ...callData,
        targetFunction: 'bytePriceVerification',
      })
      .then((readOnlyResult) => {
        return bytesToU64(readOnlyResult.returnValue);
      });
  }, [client, contractAddress]);

  const readVerificationPriceOf = useCallback(() => {
    const callData = {
      targetAddress: contractAddress,
      parameter: new Args().addString(scToInspect),
    };
    if (!client) {
      return Promise.resolve(undefined);
    }
    return client
      .smartContracts()
      .readSmartContract({ ...callData, targetFunction: 'verificationPriceOf' })
      .then((readOnlyResult) => {
        return bytesToU64(readOnlyResult.returnValue);
      });
  }, [client, contractAddress, scToInspect]);

  const readIsPaidVerification = useCallback(() => {
    const callData = {
      targetAddress: contractAddress,
      parameter: new Args().addString(scToInspect),
    };
    if (!client) {
      return Promise.resolve(undefined);
    }
    return client
      .smartContracts()
      .readSmartContract({ ...callData, targetFunction: 'isPaidVerification' })
      .then((readOnlyResult) => {
        return byteToBool(readOnlyResult.returnValue);
      });
  }, [client, contractAddress, scToInspect]);

  const readGetWasm = useCallback(() => {
    const callData = {
      targetAddress: contractAddress,
      parameter: new Args().addString(scToInspect),
    };
    if (!client) {
      return Promise.resolve(undefined);
    }
    return client
      .smartContracts()
      .readSmartContract({ ...callData, targetFunction: 'getWasm' })
      .then((readOnlyResult) => {
        return readOnlyResult.returnValue;
      });
  }, [client, contractAddress, scToInspect]);

  useEffect(() => {
    readBytePriceScan().then(setBytePriceScan);
    readScanPriceOf().then(setScanPriceOf);
    readIsPaidScan().then(setIsPaidScan);
    readBytePriceVerification().then(setBytePriceVerification);
    readVerificationPriceOf().then(setVerificationPriceOf);
    readIsPaidVerification().then(setIsPaidVerification);
  }, [
    readBytePriceScan,
    readScanPriceOf,
    readIsPaidScan,
    readBytePriceVerification,
    readVerificationPriceOf,
    readIsPaidVerification,
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
