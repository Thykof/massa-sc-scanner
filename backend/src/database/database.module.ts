import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DatabaseService } from './database.service';
import { DataSourceOptions } from 'typeorm';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { SmartContract } from './entities/SmartContract';

export let mongoMemory: MongoMemoryServer;

export const getConfig = async (): Promise<DataSourceOptions> => {
  const uri = process.env.DB_URI;

  const isTest = process.env.NODE_ENV === 'test';
  const useMeMoryDB = isTest || !uri;
  if (useMeMoryDB && !mongoMemory) {
    mongoMemory = await MongoMemoryServer.create({
      binary: { version: '7.0.0' },
    });
    console.log('MongoDB Memory Server created: ' + mongoMemory.getUri());
  }

  return {
    type: 'mongodb',
    entities: [SmartContract],
    synchronize: process.env.DB_SYNC === 'true',
    url: useMeMoryDB ? mongoMemory.getUri() : uri,
  };
};

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async (): Promise<TypeOrmModuleOptions> => getConfig(),
    }),
    TypeOrmModule.forFeature([SmartContract]),
  ],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
