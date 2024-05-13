import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

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
    return this.appService.wasm2wat(
      await this.appService.address2wasm(address),
    );
  }

  @Get('abis/:address')
  async abis(@Param('address') address: string): Promise<string[]> {
    return this.appService.importedABIs(
      await this.appService.wasm2wat(
        await this.appService.address2wasm(address),
      ),
    );
  }

  @Get('functions/:address')
  async functions(@Param('address') address: string): Promise<string[]> {
    return this.appService.exportedFunctions(
      await this.appService.wasm2wat(
        await this.appService.address2wasm(address),
      ),
    );
  }

  @Get('name/:address')
  async name(@Param('address') address: string): Promise<string> {
    return this.appService.sourceMapName(
      this.appService.wasm2utf8(await this.appService.address2wasm(address)),
    );
  }
}
