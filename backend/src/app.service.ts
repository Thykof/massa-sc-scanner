import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import * as fs from 'fs';
import { SmartContract } from './database/entities/SmartContract';
import { ClientService } from './client/client.service';
import * as path from 'path';
import * as os from 'os';
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
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'verifier'));
    const workingDir = path.join(tmpDir, zipHash);
    zip.extractAllTo(workingDir, true);
    this.validateZip(workingDir);

    let output = '';
    output += await this.executeCommand(
      workingDir,
      `npm pkg delete scripts && npm ci`,
    );
    output += await this.runNpmAudit(workingDir);
    output += await this.executeCommand(workingDir, `npx massa-as-compile`);

    this.logger.log(output);

    const binaryPath = path.join(workingDir, 'build', `${contractName}.wasm`);
    let providedWasmHash = '';
    try {
      const binary = fs.readFileSync(binaryPath);
      providedWasmHash = this.hashFile(binary);
    } catch (error) {
      this.logger.error(`error hashing compiled: ${error.message}`);
    }

    fs.rmSync(tmpDir, { recursive: true });

    return { providedWasmHash, output };
  }

  private async executeCommand(
    directory: string,
    command: string,
  ): Promise<string> {
    this.logger.log(
      `executing command: ${command}, in directory: ${directory}`,
    );
    try {
      const { stdout, stderr } = await execPromise(command, {
        cwd: directory,
      });
      return stderr + '\n' + stdout;
    } catch (err) {
      this.logger.error('Failed to execute command');
      return `Failed to execute command: ${err.message}`;
    }
  }

  private storeZip(file: Express.Multer.File) {
    const zipHash = this.hashFile(file.buffer);
    const filename = `${zipHash}-${new Date().getTime()}.zip`;

    return { zipHash, filename };
  }

  private async runNpmAudit(directory: string): Promise<string> {
    let stdout = '';
    let stderr = '';
    try {
      this.logger.log('Running npm audit');
      const child = await execPromise('npm audit --json', {
        cwd: directory,
      });
      stdout = child.stdout;
      stderr = child.stderr;
    } catch (error) {
      stdout = error.stdout;
      stderr = error.stderr;
    }

    const auditReport = JSON.parse(stdout);
    if (auditReport.metadata.vulnerabilities.critical > 0) {
      this.logger.log('Security vulnerabilities found!');
      throw new Error('Audit failed due to security vulnerabilities.');
    }
    return stdout + '\n' + stderr;
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
      fs.existsSync(path.join(directory, '.git')) ||
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
