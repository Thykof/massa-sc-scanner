import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import * as fs from 'fs';
import { SmartContract } from './database/entities/SmartContract';
import { ClientService } from './client/client.service';
import * as path from 'path';
import * as AdmZip from 'adm-zip';
import { exec } from 'child_process';
import { promisify } from 'util';
import { DatabaseService } from './database/database.service';

const execPromise = promisify(exec);

@Injectable()
export class AppService {
  private readonly logger = new Logger('SERVICE');
  constructor(
    private readonly clientService: ClientService,
    private readonly databaseService: DatabaseService,
  ) {}

  public async verify(
    address: string,
    network: bigint,
    file: Express.Multer.File,
  ) {
    if (!address) {
      throw new HttpException('address is required', HttpStatus.BAD_REQUEST);
    }
    if (await this.databaseService.isVerified(address)) {
      throw new HttpException('already verified', HttpStatus.FORBIDDEN);
    }
    if (!(await this.clientService.isPaid(address, network))) {
      throw new HttpException('pay to verify', HttpStatus.FORBIDDEN);
    }
    const { zipHash, filename } = this.storeZip(file);
    const deployedWasm = await this.clientService.getWasm(address, network);
    const deployedWasmHash = this.hashBytes(deployedWasm);

    const contractName = this.clientService.sourceMapName(
      this.clientService.wasm2utf8(deployedWasm),
    );

    const { providedWasmHash, output } = await this.processZip(
      file,
      zipHash,
      contractName,
    );

    const sourceCodeValid = deployedWasmHash === providedWasmHash;
    if (!sourceCodeValid) {
      throw new HttpException(
        'source code does not match',
        HttpStatus.BAD_REQUEST,
      );
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
    this.databaseService.saveSmartContract(smartContract);

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

  async getVerifiedZip(address: string, network: bigint) {
    const deployedWasm = await this.clientService.getWasm(address, network);
    const deployedWasmHash = this.hashBytes(deployedWasm);

    const smartContract = await this.databaseService.getSmartContracts(address);
    for (const contract of smartContract) {
      if (contract.deployedWasmHash === deployedWasmHash) {
        return { data: contract.zipData, filename: contract.zipFilename };
      }
    }

    throw new HttpException('File not found', HttpStatus.NOT_FOUND);
  }

  private async processZip(
    file: Express.Multer.File,
    zipHash: string,
    contractName: string,
  ) {
    const zip = new AdmZip(file.buffer);
    const outputDir = './unzipped';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
    const workingDir = path.join(outputDir, zipHash);
    zip.extractAllTo(workingDir, true);
    this.validateZip(workingDir);

    let output = '';

    try {
      const result = await this.executeCommand(
        undefined,
        `cd ${workingDir} && npm pkg delete scripts && npm ci && npm i @massalabs/massa-sc-compiler && npx massa-as-compile`,
      );
      output += result.output + '\n';
    } catch (error) {
      this.logger.error(`error processing zip: ${error.message}`);
    }

    this.logger.log('3t command done');
    this.logger.log(output);

    const binaryPath = path.join(workingDir, 'build', `${contractName}.wasm`);
    let providedWasmHash = '';
    try {
      const binary = fs.readFileSync(binaryPath);
      providedWasmHash = this.hashFile(binary);
    } catch (error) {
      this.logger.error(`error hashing compiled: ${error.message}`);
    }

    fs.rmSync(workingDir, { recursive: true });

    return { providedWasmHash, output };
  }

  private async executeCommand(directory: string | undefined, command: string) {
    this.logger.log(
      `executing command: ${command}, in directory: ${directory}`,
    );
    try {
      if (directory) {
        const { stdout, stderr } = await execPromise(command);
        return { output: stderr + '\n' + stdout };
      } else {
        const { stdout, stderr } = await execPromise(command, {
          cwd: directory,
        });
        return { output: stderr + '\n' + stdout };
      }
      // TODO: how to handle the error?
    } catch (err) {
      // this.logger.error(`Failed to execute command: ...`);
      this.logger.error(`Failed to execute command: ${err.message}`);
      throw err;
    }
  }

  private storeZip(file: Express.Multer.File) {
    const zipHash = this.hashFile(file.buffer);
    const filename = `${zipHash}-${new Date().getTime()}.zip`;

    return { zipHash, filename };
  }

  private hashFile(buffer: Buffer) {
    return crypto.createHash('sha1').update(buffer).digest('hex');
  }

  private hashBytes(bytes: Uint8Array) {
    return crypto.createHash('sha1').update(bytes).digest('hex');
  }

  private validateZip(directory: string) {
    if (
      fs.existsSync(path.join(directory, 'node_modules')) ||
      fs.existsSync(path.join(directory, 'build')) ||
      fs.existsSync(path.join(directory, 'dist')) ||
      fs.existsSync(path.join(directory, '.env')) ||
      !fs.existsSync(path.join(directory, 'assembly')) ||
      !fs.existsSync(path.join(directory, 'package.json'))
    ) {
      throw new HttpException(
        'error processing zip: invalid directory structure',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
