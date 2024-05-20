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
    zipHash = '',
    zipSize = 0,
    zipData: Buffer = Buffer.from(''),
    output = '',
    createdAt: Date = new Date(),
  ) {
    super();
    this.address = address;
    this.contractName = contractName;
    this.deployedWasmHash = deployedWasmHash;
    this.providedWasmHash = providedWasmHash;
    this.zipFilename = zipFilename;
    this.zipHash = zipHash;
    this.zipSize = zipSize;
    this.zipData = zipData;
    this.output = output;
    this.createdAt = createdAt;
  }

  @ObjectIdColumn() id: ObjectId;

  @Column() address: string;
  @Column() contractName: string;
  @Column() deployedWasmHash: string;
  @Column() providedWasmHash: string;
  @Column() zipFilename: string;
  @Column() zipHash: string;
  @Column() zipSize: number;
  @Column({ type: 'binary' }) zipData: Buffer;
  @Column() output: string;
  @CreateDateColumn() createdAt: Date;
}
