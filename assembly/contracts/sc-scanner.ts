import {
  Address,
  balance,
  setBytecode as _setBytecode,
  Context,
  createEvent,
  generateEvent,
  getBytecodeOf,
  getOriginOperationId,
  Storage,
  transferCoins,
  getKeys,
} from '@massalabs/massa-as-sdk';
import {
  Args,
  bytesToU64,
  stringToBytes,
  u64ToBytes,
} from '@massalabs/as-types';
import {
  onlyOwner,
  setOwner,
} from '@massalabs/sc-standards/assembly/contracts/utils/ownership';
import { OWNER_KEY } from '@massalabs/sc-standards/assembly/contracts/utils/ownership-internal';

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
  const length = bytecode.length;
  const price = bytePrice * u64(length);

  generateEvent(createEvent('price', [price.toString()]));

  if (Context.caller().toString() !== Storage.get(OWNER_KEY)) {
    const callerPayment = Context.transferredCoins();
    if (callerPayment < u64(price)) {
      generateEvent('abort, not enough payment');
      throw new Error('not enough payment');
    }
  }

  if (getOriginOperationId() === null) {
    // don't return the bytecode in a read-only call, user must pay
    generateEvent('abort, no opId');
    return [];
  }

  generateEvent(createEvent('bytecode', [bytecode.toString()]));
  return bytecode;
}

// Read

export function bytePrice(_: StaticArray<u8>): StaticArray<u8> {
  return Storage.get(KEY_BYTE_PRICE);
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
