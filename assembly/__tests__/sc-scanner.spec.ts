import {
  constructor,
  bytecodeOf,
  withdraw,
  setBytePrice,
  bytePrice,
  selfDestruct,
  setBytecode,
} from '../contracts/sc-scanner';
import {
  mockAdminContext,
  changeCallStack,
  resetStorage,
  mockTransferredCoins,
  mockBalance,
  balanceOf,
  setBytecodeOf,
  Address,
} from '@massalabs/massa-as-sdk';
import { Args, stringToBytes, u64ToBytes } from '@massalabs/as-types';

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

describe('bytecodeOf', () => {
  test('not enough payment', () => {
    mockTransferredCoins(0);
    expect(() => {
      bytecodeOf(args);
    }).toThrow();
  });
  test('success', () => {
    mockTransferredCoins(800000000000);
    expect(bytecodeOf(args)).toStrictEqual(bytecode);
  });
  test("admin don't pay", () => {
    switchUser(adminAddress);
    expect(bytecodeOf(args)).toStrictEqual(bytecode);
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

describe('selfDestruct', () => {
  throws('not owner', () => {
    selfDestruct([]);
  });
  test('success', () => {
    switchUser(adminAddress);
    mockBalance(contractAddress, 1_000_000_000);
    selfDestruct([]);
    expect(balanceOf(contractAddress)).toStrictEqual(0);
    expect(balanceOf(adminAddress)).toStrictEqual(1_000_000_000);
  });
});

describe('setBytecode', () => {
  throws('not owner', () => {
    setBytecode([]);
  });
  test('success', () => {
    switchUser(adminAddress);
    const newBytecode = stringToBytes('new bytecode');
    setBytecode(newBytecode);
    expect(
      bytecodeOf(new Args().add(contractAddress).serialize()),
    ).toStrictEqual(newBytecode);
  });
});
