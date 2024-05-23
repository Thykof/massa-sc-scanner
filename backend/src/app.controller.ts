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
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ClientService } from './client/client.service';
import { AppService } from './app.service';
import { DatabaseService } from './database/database.service';
import { ZIP_MIME_TYPE } from './const';

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
          fileType: ZIP_MIME_TYPE,
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
    throw new HttpException('Not implemented', HttpStatus.NOT_IMPLEMENTED);
    try {
      this.logger.log(`verify ${body.address}`);
      return await this.appService.verify(body.address, file);
    } catch (error) {
      this.logger.error(error.message);
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'internal error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // curl http://localhost:3000/AS.../zip
  @Get(':address/zip')
  async downloadFile(@Param('address') address: string, @Res() res: Response) {
    const { data, filename } = await this.appService.getVerifiedZip(address);

    if (!data) {
      throw new HttpException('File not found', HttpStatus.NOT_FOUND);
    }

    res.set({
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Type': ZIP_MIME_TYPE,
    });

    res.end(Buffer.from(data.toString('base64'), 'base64'), 'binary');
  }

  // curl http://localhost:3000/AS.../wasm
  @Get(':address/wasm')
  async downloadWasm(@Param('address') address: string, @Res() res: Response) {
    const data = await this.clientService.address2wasm(address);

    if (!data) {
      throw new HttpException('File not found', HttpStatus.NOT_FOUND);
    }

    res.set({
      'Content-Disposition': `attachment; filename="${address}.wasm"`,
      'Content-Type': 'application/octet-stream',
    });

    res.end(Buffer.from(data), 'binary');
  }

  // curl http://localhost:3000/AS.../wat
  @Get(':address/wat')
  async downloadWat(@Param('address') address: string, @Res() res: Response) {
    const data = await this.clientService.wasm2wat(
      await this.clientService.address2wasm(address),
    );

    if (!data) {
      throw new HttpException('File not found', HttpStatus.NOT_FOUND);
    }

    res.set({
      'Content-Disposition': `attachment; filename="${address}.wat"`,
      'Content-Type': 'text/plain',
    });

    res.end(Buffer.from(data));
  }

  // curl http://localhost:3000/AS.../verified
  @Get(':address/verified')
  async verified(@Param('address') address: string) {
    return {
      sourceCodeValid: await this.databaseService.isVerified(address),
    };
  }

  @Get(':address/inspect')
  async inspect(@Param('address') address: string) {
    return {
      address,
      abis: await this.abis(address),
      functions: await this.functions(address),
      name: await this.name(address),
    };
  }

  @Get(':address/abis')
  async abis(@Param('address') address: string): Promise<string[]> {
    return this.clientService.importedABIs(
      await this.clientService.wasm2wat(
        await this.clientService.address2wasm(address),
      ),
    );
  }

  @Get(':address/functions')
  async functions(@Param('address') address: string): Promise<string[]> {
    return this.clientService.exportedFunctions(
      await this.clientService.wasm2wat(
        await this.clientService.address2wasm(address),
      ),
    );
  }

  @Get(':address/name')
  async name(@Param('address') address: string): Promise<string> {
    return this.clientService.sourceMapName(
      this.clientService.wasm2utf8(
        await this.clientService.address2wasm(address),
      ),
    );
  }
}
