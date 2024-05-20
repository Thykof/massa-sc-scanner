import {
  Args,
  BUILDNET_CHAIN_ID,
  byteToBool,
  Client,
  ClientFactory,
  DefaultProviderUrls,
  MAINNET_CHAIN_ID,
} from '@massalabs/massa-web3';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as os from 'os';
import * as fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Injectable()
export class ClientService {
  public client: Client;
  public contractAddress: string;

  public async onModuleInit(): Promise<void> {
    if (process.env.CHAIN_ID === MAINNET_CHAIN_ID.toString()) {
      this.client = await ClientFactory.createDefaultClient(
        DefaultProviderUrls.MAINNET,
        MAINNET_CHAIN_ID,
      );
      this.contractAddress = process.env.SC_ADDRESS_SCANNER_MAINNET;
    } else {
      this.client = await ClientFactory.createDefaultClient(
        DefaultProviderUrls.BUILDNET,
        BUILDNET_CHAIN_ID,
      );
      this.contractAddress = process.env.SC_ADDRESS_SCANNER_BUILDNET;
    }
  }

  async isPaid(address: string): Promise<boolean> {
    console.log('this.contractAddress ', this.contractAddress);
    console.log('address ', address);

    const callData = {
      targetAddress: this.contractAddress,
      parameter: new Args().addString(address),
    };
    const readOnlyResult = await this.client
      .smartContracts()
      .readSmartContract({ ...callData, targetFunction: 'isPaid' });
    return byteToBool(readOnlyResult.returnValue);
  }

  async getWasm(address: string): Promise<Uint8Array> {
    const callData = {
      targetAddress: this.contractAddress,
      parameter: new Args().addString(address),
    };
    const readOnlyResult = await this.client
      .smartContracts()
      .readSmartContract({ ...callData, targetFunction: 'getWasm' });
    return readOnlyResult.returnValue;
  }

  async address2wasm(address: string): Promise<Uint8Array> {
    const readOnlyResult = await this.client
      .smartContracts()
      .readSmartContract({
        targetAddress: this.contractAddress,
        targetFunction: 'bytecodeOf',
        parameter: new Args().addString(address).serialize(),
      });
    if (readOnlyResult.returnValue.length === 0) {
      throw new HttpException(
        'Empty bytecode, pay first',
        HttpStatus.FORBIDDEN,
      );
    }

    return readOnlyResult.returnValue;
  }

  async wasm2wat(wasm: Uint8Array): Promise<string> {
    const dir = os.tmpdir();
    const filenameWasm = `${dir}/sc.wasm`;
    fs.writeFileSync(filenameWasm, wasm);
    const filenameWat = `${dir}/sc.wat`;
    await execAsync(`wasm2wat ${filenameWasm} -o ${filenameWat}`);
    const wat = fs.readFileSync(filenameWat, 'utf8');

    return wat;
  }

  wasm2utf8(wasm: Uint8Array): string {
    const buffer = Buffer.from(wasm);

    return buffer.toString('utf-8');
  }

  importedABIs(wat: string): string[] {
    const regex = /assembly_script_(\w+)/gi;

    const matches = [...wat.matchAll(regex)];

    return matches.map((match) => match[1]);
  }

  exportedFunctions(wat: string): string[] {
    const regex = /\(export "(\w+)"/gi;

    const matches = [...wat.matchAll(regex)];

    return matches.map((match) => match[1]);
  }

  sourceMapName(wasm: string): string {
    const regex = /sourceMappingURL.*\.\/(.+)\.wasm\.map/gi;

    const matches = [...wasm.matchAll(regex)];

    return matches.map((match) => match[1])[0];
  }
}
