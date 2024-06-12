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

export async function getSmartContracts(
  address: string,
): Promise<SmartContract[]> {
  await initDataSource();
  const repo = dataSource.getMongoRepository(SmartContract);
  return await repo.find({ where: { address } });
}
