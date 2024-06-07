import * as wasmparser from 'wasmparser';
import * as wasmdis from 'wasmparser/dist/cjs/WasmDis';
import { address2wasm, initClient } from './client';

export async function downloadWat(address: string, chainIdString: string) {
  const { client, scannerAddress } = await initClient(BigInt(chainIdString));

  const wasm = await address2wasm(client, scannerAddress, address);
  const wat = wasm2wat(wasm);

  return Buffer.from(wat);
}

export async function downloadWasm(address: string, chainIdString: string) {
  const { client, scannerAddress } = await initClient(BigInt(chainIdString));

  const wasm = await address2wasm(client, scannerAddress, address);

  return Buffer.from(wasm);
}

export function wasm2wat(wasm: Uint8Array): string {
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

export function wasm2utf8(wasm: Uint8Array): string {
  const buffer = Buffer.from(wasm);

  return buffer.toString('utf-8');
}

export function importedABIs(wat: string): string[] {
  const regex = /assembly_script_(\w+)/gi;

  const matches = [...wat.matchAll(regex)];

  return matches.map((match) => match[1]);
}

export function exportedFunctions(wat: string): string[] {
  const regex = /\(export "(\w+)" \(func/gi;

  const matches = [...wat.matchAll(regex)];

  return matches.map((match) => match[1]);
}

export function exportedGlobals(wat: string): string[] {
  const regex = /\(export "(\w+)" \(global/gi;

  const matches = [...wat.matchAll(regex)];

  return matches.map((match) => match[1]);
}

export function exportedMemories(wat: string): string[] {
  const regex = /\(export "(\w+)" \(memory/gi;

  const matches = [...wat.matchAll(regex)];

  return matches.map((match) => match[1]);
}

export function sourceMapName(wasm: string): string {
  const regex = /sourceMappingURL.*\.\/(.+)\.wasm\.map/gi;

  const matches = [...wasm.matchAll(regex)];

  return matches.map((match) => match[1])[0];
}

export function data(wat: string): string[] {
  return wat
    .split('\n')
    .filter((l) => l.includes('i32.const') && l.includes('data'))
    .map((l) => {
      const lineSlit = l.split('"');
      if (lineSlit.length < 2) return '';
      const encodedString = lineSlit[1];
      const lineSlit2 = encodedString.split('\\');
      if (lineSlit2.length < 2) return '';
      const encodedString2 = lineSlit2.join('\\');
      const text = encodedString2.split('\\00').join('');
      return text.replace(/\\/g, '').slice(3);
    })
    .filter((l) => l.length > 2);
}

export function texts(constants: string[]): string[] {
  return constants.filter((c) => !c.includes('~lib'));
}

export function libs(constants: string[]): string[] {
  return constants
    .filter((c) => c.includes('~lib'))
    .map((c) => {
      const splitted = c.split('~lib');
      return splitted[splitted.length - 1].slice(1);
    });
}

export async function scanSmartContract(
  address: string,
  chainIdString: string,
) {
  const { client, scannerAddress } = await initClient(BigInt(chainIdString));

  const wasm = await address2wasm(client, scannerAddress, address);

  return scanBytecode(wasm);
}

export function scanBytecode(bytecode: Uint8Array) {
  const wat = wasm2wat(bytecode);
  const wasmUtf8 = wasm2utf8(bytecode);
  const constants = data(wat);

  return {
    abis: importedABIs(wat),
    exportedFunctions: exportedFunctions(wat),
    exportedGlobals: exportedGlobals(wat),
    exportedMemories: exportedMemories(wat),
    name: sourceMapName(wasmUtf8),
    declaredTexts: texts(constants),
    usedLibraries: libs(constants),
  };
}
