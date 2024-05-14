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

const KEY_BYTE_PRICE_SCAN = stringToBytes('BPS');
const KEY_BYTE_PRICE_VERIFICATION = stringToBytes('BPV');
const PREFIX_PAID_SCAN = 'PS'; // Paid Scan
const PREFIX_PAID_VERIFICATION = 'PV'; // Paid Verification
export const initialBytePriceScan = 100_000_000_000;
export const initialBytePriceVerification = 1_000_000_000_000;

export function constructor(_: StaticArray<u8>): StaticArray<u8> {
  // This line is important. It ensures that this function can't be called in the future.
  // If you remove this check, someone could call your constructor function and reset your smart contract.
  if (!Context.isDeployingContract()) {
    return stringToBytes('Already deployed');
  }
  setOwner(new Args().add(Context.caller()).serialize());
  Storage.set(KEY_BYTE_PRICE_SCAN, u64ToBytes(initialBytePriceScan));
  Storage.set(
    KEY_BYTE_PRICE_VERIFICATION,
    u64ToBytes(initialBytePriceVerification),
  );
  return [];
}

// Write

export function payScan(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);
  const address = args.nextString().expect('address not provided');
  const byteCodeLength = getBytecodeLength(address);
  assert(!getIsPaidScan(byteCodeLength, address), 'Already paid');
  checkPayment(getScanPrice(address));
  setPaidScan(byteCodeLength, address);
  generateEvent(createEvent('PaidScan', [address]));
}

export function payVerification(binaryArgs: StaticArray<u8>): void {
  const args = new Args(binaryArgs);
  const address = args.nextString().expect('address not provided');
  const byteCodeLength = getBytecodeLength(address);
  assert(!getIsPaidVerification(byteCodeLength, address), 'Already paid');
  checkPayment(getVerificationPrice(address));
  setPaidVerification(byteCodeLength, address);
  generateEvent(createEvent('PaidVerify', [address]));
}

// Read

export function getWasm(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const address = args.nextString().expect('address not provided');
  const bytecode = getBytecodeOf(new Address(address));
  assert(
    getIsPaidScan(bytecode.length, address) ||
      getIsPaidVerification(bytecode.length, address),
    'Not paid',
  );

  return bytecode;
}

export function isPaidScan(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const address = args.nextString().expect('address not provided');
  return boolToByte(getIsPaidScan(getBytecodeLength(address), address));
}

export function isPaidVerification(
  binaryArgs: StaticArray<u8>,
): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const address = args.nextString().expect('address not provided');
  return boolToByte(getIsPaidVerification(getBytecodeLength(address), address));
}

export function bytePriceScan(_: StaticArray<u8>): StaticArray<u8> {
  return Storage.get(KEY_BYTE_PRICE_SCAN);
}

export function bytePriceVerification(_: StaticArray<u8>): StaticArray<u8> {
  return Storage.get(KEY_BYTE_PRICE_VERIFICATION);
}

export function scanPriceOf(binaryArgs: StaticArray<u8>): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const address = args.nextString().expect('address not provided');
  return u64ToBytes(getScanPrice(address));
}

export function verificationPriceOf(
  binaryArgs: StaticArray<u8>,
): StaticArray<u8> {
  const args = new Args(binaryArgs);
  const address = args.nextString().expect('address not provided');
  return u64ToBytes(getVerificationPrice(address));
}

// Internal

function getBytecodeLength(address: string): i32 {
  return getBytecodeOf(new Address(address)).length;
}

function getScanPrice(address: string): u64 {
  const bytePrice = bytesToU64(Storage.get(KEY_BYTE_PRICE_SCAN));
  const price = bytePrice * u64(getBytecodeLength(address));
  return price;
}

function getVerificationPrice(address: string): u64 {
  const bytePrice = bytesToU64(Storage.get(KEY_BYTE_PRICE_VERIFICATION));
  const price = bytePrice * u64(getBytecodeLength(address));
  return price;
}

function setPaidScan(byteCodeLength: i32, address: string): void {
  Storage.set(keyScan(address), i32ToBytes(byteCodeLength));
}

function setPaidVerification(byteCodeLength: i32, address: string): void {
  Storage.set(keyVerification(address), i32ToBytes(byteCodeLength));
}

function getIsPaidScan(byteCodeLength: i32, address: string): bool {
  const key = keyScan(address);
  if (Storage.has(key)) {
    return bytesToI32(Storage.get(key)) >= byteCodeLength;
  }
  return false;
}

function getIsPaidVerification(byteCodeLength: i32, address: string): bool {
  const key = keyVerification(address);
  if (Storage.has(key)) {
    return bytesToI32(Storage.get(key)) >= byteCodeLength;
  }
  return false;
}

function keyScan(address: string): StaticArray<u8> {
  return stringToBytes(PREFIX_PAID_SCAN + address);
}

function keyVerification(address: string): StaticArray<u8> {
  return stringToBytes(PREFIX_PAID_VERIFICATION + address);
}

function checkPayment(price: u64): void {
  const payment = Context.transferredCoins();
  assert(payment === price, `Invalid payment: ${payment}, expected ${price}`);
}

// Admin write

export function setScanBytePrice(binaryArgs: StaticArray<u8>): void {
  onlyOwner();
  const args = new Args(binaryArgs);
  const price = args.nextU64().expect('price not provided');
  Storage.set(KEY_BYTE_PRICE_SCAN, u64ToBytes(price));
  generateEvent(createEvent('setScanBytePrice', [price.toString()]));
}

export function setVerificationBytePrice(binaryArgs: StaticArray<u8>): void {
  onlyOwner();
  const args = new Args(binaryArgs);
  const price = args.nextU64().expect('price not provided');
  Storage.set(KEY_BYTE_PRICE_VERIFICATION, u64ToBytes(price));
  generateEvent(createEvent('setVerificationBytePrice', [price.toString()]));
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
