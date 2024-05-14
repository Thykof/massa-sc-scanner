import {
  bytePriceScan,
  bytePriceVerification,
  constructor,
  initialBytePriceScan,
  initialBytePriceVerification,
  payScan,
  verificationPriceOf,
  withdraw,
  isPaidVerification,
  scanPriceOf,
  payVerification,
  setScanBytePrice,
  setVerificationBytePrice,
  getWasm,
  isPaidScan,
} from '../contracts/sc-scanner';
import {
  mockAdminContext,
  changeCallStack,
  resetStorage,
  mockTransferredCoins,
  mockBalance,
  setBytecodeOf,
  Address,
  balanceOf,
} from '@massalabs/massa-as-sdk';
import {
  Args,
  bytesToU64,
  byteToBool,
  stringToBytes,
  u64ToBytes,
} from '@massalabs/as-types';

const contractAddress = 'AS12BqZEQ6sByhRLyEuf0YbQmcF2PsDdkNNG1akBJu9XcjZA1eT';
const adminAddress = 'AU1mhPhXCfh8afoNnbW91bXUVAmu8wU7u8v54yNTMvY7E52KBbz3';
const userAddress = 'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKq';
const targetAddress = 'AS1uhFrx6fJzbQKQPfda7ucPvSuVqUbRgN9NTeaBbo1vJy5urNHB';

const bytecode = stringToBytes('bytecode');

function switchUser(user: string): void {
  changeCallStack(user + ' , ' + contractAddress);
}

beforeEach(() => {
  resetStorage();
  mockAdminContext(true);
  switchUser(adminAddress);
  constructor([]);

  mockAdminContext(false);
  switchUser(userAddress);
  mockBalance(targetAddress, 0);
  setBytecodeOf(new Address(targetAddress), bytecode);
});

const args = new Args().add(targetAddress).serialize();

describe('getWasm', () => {
  throws('no payment', () => {
    expect(getWasm(args)).toStrictEqual(bytecode);
  });
  test('payment scan', () => {
    mockTransferredCoins(bytesToU64(scanPriceOf(args)));
    payScan(args);
    expect(getWasm(args)).toStrictEqual(bytecode);
  });
  test('payment verify', () => {
    mockTransferredCoins(bytesToU64(verificationPriceOf(args)));
    payVerification(args);
    expect(getWasm(args)).toStrictEqual(bytecode);
  });
  test('payment both', () => {
    mockTransferredCoins(bytesToU64(scanPriceOf(args)));
    payScan(args);
    mockTransferredCoins(bytesToU64(verificationPriceOf(args)));
    payVerification(args);
    expect(getWasm(args)).toStrictEqual(bytecode);
  });
});

describe('payScan', () => {
  throws('invalid payment', () => {
    payScan(args);
  });
  test('success', () => {
    mockTransferredCoins(bytesToU64(scanPriceOf(args)));
    payScan(args);
    expect(byteToBool(isPaidScan(args))).toStrictEqual(true);
  });
  throws('already paid', () => {
    mockTransferredCoins(bytesToU64(scanPriceOf(args)));
    payScan(args);
    payScan(args);
  });
});

describe('payVerify', () => {
  throws('invalid payment', () => {
    payVerification(args);
  });
  test('success', () => {
    mockTransferredCoins(bytesToU64(verificationPriceOf(args)));
    payVerification(args);
    expect(byteToBool(isPaidVerification(args))).toStrictEqual(true);
  });
  throws('already paid', () => {
    mockTransferredCoins(bytesToU64(scanPriceOf(args)));
    payVerification(args);
    payVerification(args);
  });
});

describe('scanPriceOf', () => {
  test('', () => {
    mockTransferredCoins(0);
    expect(bytesToU64(scanPriceOf(args))).toStrictEqual(
      initialBytePriceScan * bytecode.length,
    );
  });
});

describe('verificationPriceOf', () => {
  test('', () => {
    mockTransferredCoins(0);
    expect(bytesToU64(verificationPriceOf(args))).toStrictEqual(
      initialBytePriceVerification * bytecode.length,
    );
  });
});

describe('bytePriceScan', () => {
  test('', () => {
    mockTransferredCoins(0);
    expect(bytesToU64(bytePriceScan(args))).toStrictEqual(initialBytePriceScan);
  });
});

describe('bytePriceVerify', () => {
  test('', () => {
    mockTransferredCoins(0);
    expect(bytesToU64(bytePriceVerification(args))).toStrictEqual(
      initialBytePriceVerification,
    );
  });
});

describe('isPaidScan', () => {
  test('', () => {
    mockTransferredCoins(0);
    expect(byteToBool(isPaidScan(args))).toStrictEqual(false);
  });
});

describe('isPaidVerify', () => {
  test('', () => {
    mockTransferredCoins(0);
    expect(byteToBool(isPaidVerification(args))).toStrictEqual(false);
  });
});

describe('setScanBytePrice', () => {
  throws('not owner', () => {
    setScanBytePrice(new Args().add(u64(1)).serialize());
  });
  test('success', () => {
    switchUser(adminAddress);
    const newPrice = u64(1_000_000_000);
    setScanBytePrice(new Args().add(u64(newPrice)).serialize());
    expect(bytePriceScan([])).toStrictEqual(u64ToBytes(newPrice));
  });
});

describe('setVerificationBytePrice', () => {
  throws('not owner', () => {
    setVerificationBytePrice(new Args().add(u64(1)).serialize());
  });
  test('success', () => {
    switchUser(adminAddress);
    const newPrice = u64(1_000_000_000);
    setVerificationBytePrice(new Args().add(u64(newPrice)).serialize());
    expect(bytePriceVerification([])).toStrictEqual(u64ToBytes(newPrice));
  });
});

describe('withdraw', () => {
  throws('not owner', () => {
    withdraw([]);
  });
  test('success', () => {
    switchUser(adminAddress);
    mockBalance(contractAddress, 1_000_000_000);
    withdraw([]);
    expect(balanceOf(contractAddress)).toStrictEqual(0);
    expect(balanceOf(adminAddress)).toStrictEqual(1_000_000_000);
  });
});
