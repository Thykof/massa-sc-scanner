import * as crypto from 'crypto';
import * as fs from 'fs';
import { SmartContract } from '../database/entities/SmartContract';
import * as path from 'path';
import * as os from 'os';
import AdmZip from 'adm-zip';
import { exec } from 'child_process';
import { promisify } from 'util';
import { sourceMapName, wasm2utf8 } from './scanner';
import { address2wasm, initClient, isPaid } from './client';
import { MAINNET_CHAIN_ID } from '@massalabs/massa-web3';
import { getVerified, saveSmartContract } from './database';

const execPromise = promisify(exec);

export async function downloadZip(address: string, chainIdString: string) {
  const { data } = await getVerifiedZip(address, BigInt(chainIdString));

  return Buffer.from(data);
}

export async function verified(address: string) {
  return {
    sourceCodeValid: !!(await getVerified(address)),
  };
}

export async function getVerifiedZip(address: string, chainId: bigint) {
  const { client, verifierAddress } = await initClient(chainId);

  const deployedWasm = await address2wasm(client, verifierAddress, address);
  const deployedWasmHash = hashBytes(deployedWasm);

  const smartContract = await getVerified(address);
  if (smartContract && smartContract.deployedWasmHash === deployedWasmHash) {
    return { data: smartContract.zipData, filename: smartContract.zipFilename };
  }

  throw new Error('File not found');
}

export interface ZipFile {
  buffer: Buffer;
  mimetype: string;
  size: number;
}

export async function verify(
  address: string,
  chainIdString: string,
  file?: ZipFile,
) {
  if (!file) {
    throw new Error('file is required');
  }
  if (file.mimetype !== 'application/zip') {
    throw new Error('file must be a zip');
  }
  if (file.size > 1024 * 1024 * 3) {
    throw new Error('file is too large');
  }
  if (!address) {
    throw new Error('address is required');
  }
  const chainId = BigInt(chainIdString);
  if (chainId === MAINNET_CHAIN_ID && (await getVerified(address))) {
    throw new Error('already verified');
  }
  const { client, verifierAddress } = await initClient(chainId);

  if (!(await isPaid(client, verifierAddress, address))) {
    throw new Error('pay to verify');
  }

  // TBD: return here

  const zipHash = hashFile(file.buffer);
  const filename = `${zipHash}-${new Date().getTime()}.zip`;
  const deployedWasm = await address2wasm(client, verifierAddress, address);
  const deployedWasmHash = hashBytes(deployedWasm);

  const contractName = sourceMapName(wasm2utf8(deployedWasm));

  const { providedWasmHash, output } = await processZip(
    file,
    zipHash,
    contractName,
  );

  const sourceCodeValid = deployedWasmHash === providedWasmHash;
  if (!sourceCodeValid) {
    throw new Error('source code does not match, or other error occurred');
  }

  const smartContract = new SmartContract(
    address,
    contractName,
    deployedWasmHash,
    providedWasmHash,
    filename,
    zipHash,
    file.size,
    file.buffer,
    output,
  );
  saveSmartContract(smartContract);

  return {
    zipHash,
    zipSize: file.buffer.length,
    contractName,
    address,
    deployedWasmHash,
    providedWasmHash,
    sourceCodeValid,
  };
}

async function processZip(
  file: ZipFile,
  zipHash: string,
  contractName: string,
) {
  const zip = new AdmZip(file.buffer);
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'verifier'));
  const workingDir = path.join(tmpDir, zipHash);
  zip.extractAllTo(workingDir, true);
  validateZip(workingDir);

  let output = '';
  output += await executeCommand(workingDir, `npm pkg delete scripts`);
  console.log(output);
  output += await executeCommand(workingDir, `npm ci --omit=dev`);
  console.log(output);
  output += await runNpmAudit(workingDir);
  console.log(output);
  output += await executeCommand(
    workingDir,
    'npm install @massalabs/massa-sc-compiler',
  );
  console.log(output);
  output += await executeCommand(workingDir, 'npx massa-as-compile');
  console.log(output);

  const files = fs.readdirSync(path.join(workingDir, 'build'));
  console.log(`files in build: ${files}`);
  const binaryPath = path.join(workingDir, 'build', `${contractName}.wasm`);
  let providedWasmHash = '';
  try {
    const binary = fs.readFileSync(binaryPath);
    providedWasmHash = hashFile(binary);
  } catch (error) {
    console.error(`error hashing compiled: ${error.message}`);
  }

  fs.rmSync(tmpDir, { recursive: true });

  return { providedWasmHash, output };
}

async function executeCommand(
  directory: string,
  command: string,
): Promise<string> {
  console.log(`executing command: ${command}, in directory: ${directory}`);
  try {
    const { stdout, stderr } = await execPromise(command, {
      cwd: directory,
    });
    return stderr + '\n' + stdout;
  } catch (err) {
    console.error('Failed to execute command');
    return `Failed to execute command: ${err.message}`;
  }
}

async function runNpmAudit(directory: string): Promise<string> {
  let stdout = '';
  let stderr = '';
  try {
    console.log('Running npm audit');
    const child = await execPromise('npm audit --json', {
      cwd: directory,
    });
    stdout = child.stdout;
    stderr = child.stderr;
  } catch (error) {
    console.error('Failed to run npm audit');
    stdout = error.stdout;
    stderr = error.stderr;
  }

  const auditReport = JSON.parse(stdout);
  if (auditReport.metadata.vulnerabilities.critical > 0) {
    console.log('Security vulnerabilities found!');
    throw new Error('Audit failed due to security vulnerabilities.');
  }
  return stdout + '\n' + stderr;
}

function hashFile(buffer: Buffer) {
  return crypto.createHash('sha1').update(buffer).digest('hex');
}

function hashBytes(bytes: Uint8Array) {
  return crypto.createHash('sha1').update(bytes).digest('hex');
}

function validateZip(directory: string) {
  if (
    fs.existsSync(path.join(directory, 'node_modules')) ||
    fs.existsSync(path.join(directory, 'build')) ||
    fs.existsSync(path.join(directory, '.git')) ||
    fs.existsSync(path.join(directory, 'dist')) ||
    fs.existsSync(path.join(directory, '.env')) ||
    !fs.existsSync(path.join(directory, 'assembly')) ||
    !fs.existsSync(path.join(directory, 'package.json'))
  ) {
    throw new Error('error processing zip: invalid directory structure');
  }
}
