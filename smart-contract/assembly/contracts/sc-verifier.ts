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
  bytesToU64,
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
export const initialBytePrice = 1_000_000_000_000;

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
  const hash = args.nextString().expect('hash not provided');
  const byteCodeLength = getBytecodeLength(address);
  assert(!getIsPaid(byteCodeLength, address, hash), 'Already paid');
  const price = getPrice(address);
  checkPayment(price);
  setPaid(byteCodeLength, address, hash);
  generateEvent(
    createEvent('paid', [
      address,
      byteCodeLength.toString(),
      hash,
      price.toString(),
    ]),
  );
}

// Read

export function getWasm(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const address = args.nextString().expect('address not provided');
  const hash = args.nextString().expect('hash not provided');
  const bytecode = getBytecodeOf(new Address(address));
  assert(getIsPaid(bytecode.length, address, hash), 'Not paid');

  return bytecode;
}

export function isPaid(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const address = args.nextString().expect('address not provided');
  const hash = args.nextString().expect('hash not provided');
  return boolToByte(getIsPaid(getBytecodeLength(address), address, hash));
}

export function paidInfo(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const address = args.nextString().expect('address not provided');
  if (!Storage.has(getKey(address))) {
    return [];
  }
  return Storage.get(getKey(address));
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
  return bytePrice * u64(getBytecodeLength(address));
}

function setPaid(byteCodeLength: i32, address: string, hash: string): void {
  // TODO: allow to pay for multiple hashes
  // and remove the byteCodeLength
  Storage.set(
    getKey(address),
    new Args().add(byteCodeLength).add(hash).serialize(),
  );
}

function getIsPaid(byteCodeLength: i32, address: string, hash: string): bool {
  const key = getKey(address);
  if (Storage.has(key)) {
    const value = new Args(Storage.get(key));
    const storedByteCodeLength = value
      .nextI32()
      .expect('byteCodeLength not stored');
    const storedHash = value.nextString().expect('hash not stored');
    if (storedByteCodeLength === byteCodeLength && storedHash === hash) {
      return true;
    }
    generateEvent(createEvent('smart contract has mutated', [address]));
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
