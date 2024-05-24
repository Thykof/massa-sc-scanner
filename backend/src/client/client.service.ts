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
import * as wasmparser from 'wasmparser';
import * as wasmdis from 'wasmparser/dist/cjs/WasmDis';

@Injectable()
export class ClientService {
  async initClient(chainId: bigint): Promise<{
    client: Client;
    scannerAddress: string;
    verifierAddress: string;
  }> {
    if (chainId === MAINNET_CHAIN_ID) {
      return {
        client: await ClientFactory.createDefaultClient(
          DefaultProviderUrls.MAINNET,
          MAINNET_CHAIN_ID,
        ),
        scannerAddress: process.env.SC_ADDRESS_SCANNER_MAINNET,
        verifierAddress: process.env.SC_ADDRESS_VERIFIER_MAINNET,
      };
    } else {
      return {
        client: await ClientFactory.createDefaultClient(
          DefaultProviderUrls.BUILDNET,
          BUILDNET_CHAIN_ID,
        ),
        scannerAddress: process.env.SC_ADDRESS_SCANNER_BUILDNET,
        verifierAddress: process.env.SC_ADDRESS_VERIFIER_BUILDNET,
      };
    }
  }

  async isPaid(address: string, chainId: bigint): Promise<boolean> {
    const { client, verifierAddress } = await this.initClient(chainId);
    const callData = {
      targetAddress: verifierAddress,
      parameter: new Args().addString(address),
    };
    const readOnlyResult = await client
      .smartContracts()
      .readSmartContract({ ...callData, targetFunction: 'isPaid' });
    return byteToBool(readOnlyResult.returnValue);
  }

  async getWasm(address: string, chainId: bigint): Promise<Uint8Array> {
    const { client, verifierAddress } = await this.initClient(chainId);
    const callData = {
      targetAddress: verifierAddress,
      parameter: new Args().addString(address),
    };
    const readOnlyResult = await client
      .smartContracts()
      .readSmartContract({ ...callData, targetFunction: 'getWasm' });
    return readOnlyResult.returnValue;
  }

  async address2wasm(address: string, chainId: bigint): Promise<Uint8Array> {
    const { client, scannerAddress } = await this.initClient(chainId);
    const readOnlyResult = await client.smartContracts().readSmartContract({
      targetAddress: scannerAddress,
      targetFunction: 'getWasm',
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

  wasm2wat(wasm: Uint8Array): string {
    const parser = new wasmparser.BinaryReader();
    parser.setData(wasm.buffer, 0, wasm.length);
    const namesReader = new wasmdis.NameSectionReader();
    namesReader.read(parser);

    parser.setData(wasm.buffer, 0, wasm.length);
    const dis = new wasmdis.WasmDisassembler();
    if (namesReader.hasValidNames()) {
      dis.nameResolver = namesReader.getNameResolver();
    }

    return dis.disassemble(parser);
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
