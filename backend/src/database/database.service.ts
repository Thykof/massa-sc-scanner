import { Injectable } from '@nestjs/common';
import { SmartContract } from './entities/SmartContract';
import { MongoRepository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class DatabaseService {
  constructor(
    @InjectRepository(SmartContract)
    public repo: MongoRepository<SmartContract>,
  ) {}

  public async saveSmartContract(smartContract: SmartContract) {
    return this.repo.save(smartContract);
  }

  public async getSmartContracts(address: string) {
    return this.repo.find({ where: { address } });
  }

  public async isVerified(address: string) {
    const smartContracts = await this.getSmartContracts(address);
    for (const smartContract of smartContracts) {
      if (smartContract.deployedWasmHash === smartContract.providedWasmHash) {
        return true;
      }
    }

    return false;
  }
}
