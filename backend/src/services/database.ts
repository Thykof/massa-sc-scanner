import { SmartContract } from 'src/database/entities/SmartContract';
import { DataSource } from 'typeorm';

export let dataSource: DataSource;

async function initDataSource() {
  if (!dataSource) {
    dataSource = new DataSource({
      type: 'mongodb',
      entities: [SmartContract],
      url: process.env.DB_URI,
    });
  }
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }
}

export async function saveSmartContract(smartContract: SmartContract) {
  await initDataSource();
  const repo = dataSource.getMongoRepository(SmartContract);
  return repo.save(smartContract);
}

export async function getVerified(
  address: string,
): Promise<SmartContract | undefined> {
  await initDataSource();
  const repo = dataSource.getMongoRepository(SmartContract);
  // TODO: refactor: use the mongo db query to check if the deployedWasmHash is the same as the providedWasmHash
  const smartContracts = await repo.find({ where: { address } });

  for (const smartContract of smartContracts) {
    if (smartContract.deployedWasmHash === smartContract.providedWasmHash) {
      return smartContract;
    }
  }

  return undefined;
}
