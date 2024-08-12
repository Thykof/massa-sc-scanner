import {
  bytesToI32,
  bytesToStr,
  bytesToU256,
  bytesToU64,
} from '@massalabs/massa-web3';
import { getClient } from './lib';
import { config } from 'dotenv';
config();

const targetAddress = 'AS121YPZJSZAFy4kss95jez1WRF16o4PRq8GE8HyvpHaQYt2spDE2';

const { client } = await getClient(process.env.WALLET_SECRET_KEY!);

const addressInfo = await client.publicApi().getAddresses([targetAddress]);
const keys = addressInfo[0].candidate_datastore_keys;
for (const k of keys) {
  const key = Uint8Array.from(k);
  console.log('--------------------------');
  console.log('key: ', key);
  console.log('key (string): ', bytesToStr(key));
  const entry = await client.publicApi().getDatastoreEntries([
    {
      address: targetAddress,
      key: key,
    },
  ]);
  const value = entry[0].candidate_value;
  console.log('  entry string: ', bytesToStr(value!));
  try {
    console.log('  entry u256: ', bytesToU256(value!));
  } catch (error) {}
  try {
    console.log('  entry u64: ', bytesToU64(value!));
  } catch (error) {}
  try {
    console.log('  entry i32: ', bytesToI32(value!));
  } catch (error) {}
}
