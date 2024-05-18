import {
  Address,
  balance,
  Context,
  createEvent,
  generateEvent,
  getBytecodeOf,
  Storage,
  transferCoins,
} from '@massalabs/massa-as-sdk';
import {
  Args,
  boolToByte,
  bytesToI32,
  bytesToU64,
  i32ToBytes,
  stringToBytes,
  u64ToBytes,
} from '@massalabs/as-types';
import {
  onlyOwner,
  setOwner,
} from '@massalabs/sc-standards/assembly/contracts/utils/ownership';

export {
  ownerAddress,
  setOwner,
} from '@massalabs/sc-standards/assembly/contracts/utils/ownership';

const KEY_BYTE_PRICE = stringToBytes('BP');
const PREFIX_PAID = 'P';
export const initialBytePrice = 100_000_000_000;
const STORAGE_BYTE_COST = 100_000;

export function constructor(_: StaticArray<u8>): StaticArray<u8> {
  // This line is important. It ensures that this function can't be called in the future.
  // If you remove this check, someone could call your constructor function and reset your smart contract.
  if (!Context.isDeployingContract()) {
    return stringToBytes('Already deployed');
  }
  setOwner(new Args().add(Context.caller()).serialize());
  Storage.set(KEY_BYTE_PRICE, u64ToBytes(initialBytePrice));
  return [];
}

// Write

export function pay(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);
  const address = args.nextString().expect('address not provided');
  const byteCodeLength = getBytecodeLength(address);
  assert(!getIsPaid(byteCodeLength, address), 'Already paid');
  const price = getPrice(address);
  checkPayment(price);
  setPaid(byteCodeLength, address);
  generateEvent(
    createEvent('paid', [address, byteCodeLength.toString(), price.toString()]),
  );
}

// Read

export function getWasm(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const address = args.nextString().expect('address not provided');
  const bytecode = getBytecodeOf(new Address(address));
  assert(getIsPaid(bytecode.length, address), 'Not paid');

  return bytecode;
}

export function isPaid(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const address = args.nextString().expect('address not provided');
  return boolToByte(getIsPaid(getBytecodeLength(address), address));
}

export function bytePrice(_: StaticArray<u8>): StaticArray<u8> {
  return Storage.get(KEY_BYTE_PRICE);
}

export function priceOf(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const address = args.nextString().expect('address not provided');
  return u64ToBytes(getPrice(address));
}

// Internal

function getBytecodeLength(address: string): i32 {
  return getBytecodeOf(new Address(address)).length;
}

function getPrice(address: string): u64 {
  const bytePrice = bytesToU64(Storage.get(KEY_BYTE_PRICE));
  return bytePrice * u64(getBytecodeLength(address)) + storageCost(address);
}

function setPaid(byteCodeLength: i32, address: string): void {
  Storage.set(getKey(address), i32ToBytes(byteCodeLength));
}

function getIsPaid(byteCodeLength: i32, address: string): bool {
  const key = getKey(address);
  if (Storage.has(key)) {
    return bytesToI32(Storage.get(key)) >= byteCodeLength;
  }
  return false;
}

function getKey(address: string): StaticArray<u8> {
  return stringToBytes(PREFIX_PAID + address);
}

function checkPayment(price: u64): void {
  const payment = Context.transferredCoins();
  assert(payment === price, `Invalid payment: ${payment}, expected ${price}`);
}

function storageCost(address: string): u64 {
  return u64(4 + 1 + address.length + 4) * STORAGE_BYTE_COST;
}

// Admin write

export function setBytePrice(binaryArgs: StaticArray<u8>): void {
  onlyOwner();
  const args = new Args(binaryArgs);
  const price = args.nextU64().expect('price not provided');
  Storage.set(KEY_BYTE_PRICE, u64ToBytes(price));
  generateEvent(createEvent('new price', [price.toString()]));
}

export function withdraw(_: StaticArray<u8>): void {
  onlyOwner();
  const caller = Context.caller();
  const amount = balance();
  transferCoins(caller, amount);
  generateEvent(
    createEvent('Withdraw', [amount.toString(), caller.toString()]),
  );
}
