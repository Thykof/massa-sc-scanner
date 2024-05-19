import {
  bytePrice,
  constructor,
  initialBytePrice,
  pay,
  withdraw,
  priceOf,
  setBytePrice,
  getWasm,
  isPaid,
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
const newBytecode = stringToBytes('new bytecode');

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
  test('payment done', () => {
    mockTransferredCoins(bytesToU64(priceOf(args)));
    pay(args);
    expect(getWasm(args)).toStrictEqual(bytecode);
  });
});

describe('pay', () => {
  throws('invalid payment', () => {
    mockTransferredCoins(0);
    pay(args);
    expect(byteToBool(isPaid(args))).toStrictEqual(true);
  });
  test('success', () => {
    mockTransferredCoins(bytesToU64(priceOf(args)));
    pay(args);
    expect(byteToBool(isPaid(args))).toStrictEqual(true);
  });
  throws('already paid', () => {
    mockTransferredCoins(bytesToU64(priceOf(args)));
    pay(args);
    pay(args);
  });
  test('mutation', () => {
    mockTransferredCoins(bytesToU64(priceOf(args)));
    pay(args);
    setBytecodeOf(new Address(targetAddress), newBytecode);
    expect(byteToBool(isPaid(args))).toStrictEqual(false);
  });
});

describe('priceOf', () => {
  test('', () => {
    expect(bytesToU64(priceOf(args))).toStrictEqual(
      initialBytePrice * bytecode.length + 6_100_000,
    );
  });
});

describe('bytePrice', () => {
  test('', () => {
    expect(bytesToU64(bytePrice(args))).toStrictEqual(initialBytePrice);
  });
});

describe('isPaid', () => {
  test('', () => {
    expect(byteToBool(isPaid(args))).toStrictEqual(false);
  });
});

describe('setBytePrice', () => {
  throws('not owner', () => {
    setBytePrice(new Args().add(u64(1)).serialize());
  });
  test('success', () => {
    switchUser(adminAddress);
    const newPrice = u64(1_000_000_000);
    setBytePrice(new Args().add(u64(newPrice)).serialize());
    expect(bytePrice([])).toStrictEqual(u64ToBytes(newPrice));
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
