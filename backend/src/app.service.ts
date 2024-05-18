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

  public async verify(address: string, file: Express.Multer.File) {
    if (!address) {
      throw new HttpException('address is required', HttpStatus.BAD_REQUEST);
    }
    if (await this.databaseService.isVerified(address)) {
      throw new HttpException('already verified', HttpStatus.FORBIDDEN);
    }
    if (!(await this.clientService.isPaid(address))) {
      throw new HttpException('pay to verify', HttpStatus.FORBIDDEN);
    }

    const { zipHash, filename } = this.storeZip(file);
    const deployedWasm = await this.clientService.getWasm(address);
    const deployedWasmHash = this.hashBytes(deployedWasm);

    const contractName = this.clientService.sourceMapName(
      this.clientService.wasm2utf8(deployedWasm),
    );

    const { providedWasmHash, output } = await this.processZip(
      file,
      zipHash,
      contractName,
    );

    const smartContract = new SmartContract(
      address,
      contractName,
      deployedWasmHash,
      providedWasmHash,
      filename,
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
      sourceCodeValid: deployedWasmHash === providedWasmHash,
    };
  }

  async processZip(
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

    let output = '';

    try {
      const result = await this.executeCommand(workingDir, 'npm install');
      output += result.output + '\n';
    } catch (error) {
      throw new HttpException(
        'error processing zip: npm install',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.executeCommand(workingDir, 'npm run build');
      output += result.output + '\n';
    } catch (error) {
      throw new HttpException(
        'error processing zip: npm run build',
        HttpStatus.BAD_REQUEST,
      );
    }

    const binaryPath = path.join(workingDir, 'build', `${contractName}.wasm`);
    const binary = fs.readFileSync(binaryPath);
    const providedWasmHash = this.hashFile(binary);

    return { providedWasmHash, output };
  }

  private async executeCommand(directory: string, command: string) {
    try {
      const { stdout, stderr } = await execPromise(command, { cwd: directory });
      // TODO: how to handle the error?
      return { output: stderr + '\n' + stdout };
    } catch (err) {
      this.logger.error(`Failed to execute command: ...`);
      // this.logger.error(`Failed to execute command: ${err.message}`);
      throw err;
    }
  }

  private storeZip(file: Express.Multer.File) {
    const zipHash = this.hashFile(file.buffer);
    if (!fs.existsSync('./upload')) {
      fs.mkdirSync('./upload');
    }
    const filename = `${zipHash}-${new Date().getTime()}.zip`;
    fs.writeFileSync(`./upload/${filename}`, file.buffer);

    return { zipHash, filename };
  }

  private hashFile(buffer: Buffer) {
    return crypto.createHash('sha1').update(buffer).digest('hex');
  }

  private hashBytes(bytes: Uint8Array) {
    return crypto.createHash('sha1').update(bytes).digest('hex');
  }
}
