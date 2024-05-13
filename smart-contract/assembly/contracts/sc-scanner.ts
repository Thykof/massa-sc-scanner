import {
  Address,
  balance,
  setBytecode as _setBytecode,
  Context,
  createEvent,
  generateEvent,
  getBytecodeOf,
  Storage,
  transferCoins,
  getKeys,
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

const KEY_BYTE_PRICE = stringToBytes('BYTE_PRICE');

export function constructor(_: StaticArray<u8>): StaticArray<u8> {
  // This line is important. It ensures that this function can't be called in the future.
  // If you remove this check, someone could call your constructor function and reset your smart contract.
  if (!Context.isDeployingContract()) {
    return stringToBytes('Already deployed');
  }
  setOwner(new Args().add(Context.caller()).serialize());
  Storage.set(KEY_BYTE_PRICE, u64ToBytes(100_000_000_000));
  return [];
}

// User

export function bytecodeOf(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const address = args.nextString().expect('address not provided');
  const bytecode = getBytecodeOf(new Address(address));
  const bytePrice = bytesToU64(Storage.get(KEY_BYTE_PRICE));
  const price = bytePrice * u64(bytecode.length);

  generateEvent(createEvent('price', [price.toString()]));

  if (Context.transferredCoins() < u64(price) && !_isPaid(address)) {
    generateEvent('abort, not enough payment');
    return [];
  } else {
    setPaid(address);
  }

  return bytecode;
}

// Read

export function isPaid(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const address = args.nextString().expect('address not provided');
  return boolToByte(_isPaid(address));
}

export function bytePrice(_: StaticArray<u8>): StaticArray<u8> {
  return Storage.get(KEY_BYTE_PRICE);
}

// Internal

function setPaid(address: string): void {
  Storage.set(key(address), [1]);
}

function _isPaid(address: string): bool {
  if (Storage.has(key(address))) {
    return Storage.get(key(address)) !== null;
  }
  return false;
}

function key(address: string): StaticArray<u8> {
  return stringToBytes('B' + address);
}

// Admin

export function setBytePrice(binaryArgs: StaticArray<u8>): void {
  onlyOwner();
  const args = new Args(binaryArgs);
  const price = args.nextU64().expect('price not provided');
  Storage.set(KEY_BYTE_PRICE, u64ToBytes(price));
  generateEvent(createEvent('SetBytePrice', [price.toString()]));
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

export function selfDestruct(_: StaticArray<u8>): void {
  onlyOwner();
  setBytecode([]);

  const keys = getKeys();
  for (let i = 0; i < keys.length; i++) {
    Storage.del(keys[i]);
  }

  transferCoins(Context.caller(), balance());
}

export function setBytecode(bytecode: StaticArray<u8>): void {
  onlyOwner();
  _setBytecode(bytecode);
}
