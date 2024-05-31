import {
  Controller,
  Get,
  Post,
  Param,
  UploadedFile,
  HttpStatus,
  UseInterceptors,
  Body,
  HttpException,
  Res,
  Query,
} from '@nestjs/common';
import { Response, Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ZIP_MIME_TYPE } from './const';
import { scanSmartContract, wasm2wat } from './services/scanner';
import { address2wasm, initClient } from './services/client';
import { getVerifiedZip, verified, verify } from './services/verifier';

class VerifyDto {
  address: string;
  chainIdString: string;
}

@Controller()
export class AppController {
  // curl -F "file=@smart-contract.zip;type=application/zip" -F "chainIdString=77658366" -F "address=AS12FWciBxUsTcbz6xRyKfdcCr6Xbd9qZrVgJQ5n5DUbFCfV3ie61" http://localhost:3000/verify
  @Post('verify')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFileAndPassValidation(
    @Body() body: VerifyDto,
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    return await verify(body.address, body.chainIdString, file);
  }

  // curl http://localhost:3000/AS.../zip?chainIdString=77658366
  @Get(':address/zip')
  async downloadFile(
    @Param('address') address: string,
    @Query('chainIdString') chainIdString: string,
    @Res() res: Response,
  ) {
    const { data, filename } = await getVerifiedZip(
      address,
      BigInt(chainIdString),
    );

    res.set({
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Type': ZIP_MIME_TYPE,
    });

    res.end(Buffer.from(data.toString('base64'), 'base64'), 'binary');
  }

  // curl http://localhost:3000/AS.../wasm?chainIdString=77658366
  @Get(':address/wasm')
  async downloadWasm(
    @Param('address') address: string,
    @Query('chainIdString') chainIdString: string,
    @Res() res: Response,
  ) {
    const { client, scannerAddress } = await initClient(BigInt(chainIdString));

    const data = await address2wasm(client, scannerAddress, address);

    if (!data) {
      throw new HttpException('File not found', HttpStatus.NOT_FOUND);
    }

    res.set({
      'Content-Disposition': `attachment; filename="${address}.wasm"`,
      'Content-Type': 'application/octet-stream',
    });

    res.end(Buffer.from(data), 'binary');
  }

  // curl http://localhost:3000/AS.../wat?chainIdString=77658366
  @Get(':address/wat')
  async downloadWat(
    @Param('address') address: string,
    @Query('chainIdString') chainIdString: string,
    @Res() res: Response,
  ) {
    const { client, scannerAddress } = await initClient(BigInt(chainIdString));

    const wasm = await address2wasm(client, scannerAddress, address);
    const wat = wasm2wat(wasm);

    if (!wat) {
      throw new HttpException('File not found', HttpStatus.NOT_FOUND);
    }

    res.set({
      'Content-Disposition': `attachment; filename="${address}.wat"`,
      'Content-Type': 'text/plain',
    });

    res.end(Buffer.from(wat));
  }

  // curl http://localhost:3000/AS.../verified?chainIdString=77658366
  @Get(':address/verified')
  async verified(@Param('address') address: string) {
    return await verified(address);
  }

  @Get(':address/inspect')
  async inspect(
    @Param('address') address: string,
    @Query('chainIdString') chainIdString: string,
  ) {
    return await scanSmartContract(address, chainIdString);
  }
}
