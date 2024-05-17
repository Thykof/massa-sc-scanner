import {
  Entity,
  Column,
  BaseEntity,
  ObjectIdColumn,
  ObjectId,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class SmartContract extends BaseEntity {
  constructor(
    address = '',
    contractName = '',
    deployedWasmHash = '',
    providedWasmHash = '',
    zipFilename = '',
    output = '',
    createdAt: Date = new Date(),
  ) {
    super();
    this.address = address;
    this.contractName = contractName;
    this.deployedWasmHash = deployedWasmHash;
    this.providedWasmHash = providedWasmHash;
    this.zipFilename = zipFilename;
    this.output = output;
    this.createdAt = createdAt;
  }

  @ObjectIdColumn() id: ObjectId;

  @Column() address: string;
  @Column() contractName: string;
  @Column() deployedWasmHash: string;
  @Column() providedWasmHash: string;
  @Column() zipFilename: string;
  @Column() output: string;
  @CreateDateColumn() createdAt: Date;
}
