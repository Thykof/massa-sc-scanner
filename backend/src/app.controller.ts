import {
  Controller,
  Get,
  Post,
  Param,
  UploadedFile,
  ParseFilePipeBuilder,
  HttpStatus,
  UseInterceptors,
  Body,
  Logger,
  HttpException,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { ClientService } from './client/client.service';
import { AppService } from './app.service';
import { DatabaseService } from './database/database.service';

class VerifyDto {
  address: string;
}

@Controller()
export class AppController {
  private readonly logger = new Logger('CONTROLLER');
  constructor(
    private readonly appService: AppService,
    private readonly clientService: ClientService,
    private readonly databaseService: DatabaseService,
  ) {}

  // curl -F "file=@smart-contract.zip;type=application/zip" -F "address=AS12FWciBxUsTcbz6xRyKfdcCr6Xbd9qZrVgJQ5n5DUbFCfV3ie61" http://localhost:3000/verify
  @Post('verify')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFileAndPassValidation(
    @Body() body: VerifyDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'application/zip',
        })
        .addMaxSizeValidator({
          maxSize: 1000 * 1000 * 3,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          fileIsRequired: true,
        }),
    )
    file: Express.Multer.File,
  ) {
    try {
      this.logger.log(`verify ${body.address}`);
      return await this.appService.verify(body.address, file);
    } catch (error) {
      const msg = `fail to verify: ${error.message}`;
      this.logger.error(msg);
      throw new HttpException(msg, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('verified/:address')
  async verified(@Param('address') address: string) {
    return {
      sourceCodeValid: this.databaseService.isVerified(address),
    };
  }

  @Get('inspect/:address')
  async inspect(@Param('address') address: string) {
    return {
      address,
      abis: await this.abis(address),
      functions: await this.functions(address),
      name: await this.name(address),
    };
  }

  @Get('wasm2wat/:address')
  async wasm2wat(@Param('address') address: string): Promise<string> {
    return this.clientService.wasm2wat(
      await this.clientService.address2wasm(address),
    );
  }

  @Get('abis/:address')
  async abis(@Param('address') address: string): Promise<string[]> {
    return this.clientService.importedABIs(
      await this.clientService.wasm2wat(
        await this.clientService.address2wasm(address),
      ),
    );
  }

  @Get('functions/:address')
  async functions(@Param('address') address: string): Promise<string[]> {
    return this.clientService.exportedFunctions(
      await this.clientService.wasm2wat(
        await this.clientService.address2wasm(address),
      ),
    );
  }

  @Get('name/:address')
  async name(@Param('address') address: string): Promise<string> {
    return this.clientService.sourceMapName(
      this.clientService.wasm2utf8(
        await this.clientService.address2wasm(address),
      ),
    );
  }
}
