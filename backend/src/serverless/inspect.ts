import { NestFactory } from '@nestjs/core';
import { Handler, APIGatewayProxyEvent } from 'aws-lambda';
import { AppModule } from '../app.module';
import { ClientService } from 'src/client/client.service';

export const handler: Handler = async (event: APIGatewayProxyEvent) => {
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const clientServer = appContext.get(ClientService);

  async function inspect(address: string, chainIdString: string) {
    const wasm = await clientServer.address2wasm(
      address,
      BigInt(chainIdString),
    );
    const wat = clientServer.wasm2wat(wasm);
    const wasmUtf8 = clientServer.wasm2utf8(wasm);

    return {
      address,
      abis: clientServer.importedABIs(wat),
      functions: clientServer.exportedFunctions(wat),
      name: clientServer.sourceMapName(wasmUtf8),
      constants: clientServer.constants(wat),
    };
  }

  console.log(`received event: ${JSON.stringify(event)}`);

  return await inspect(
    event.queryStringParameters?.address,
    event.queryStringParameters?.chainId,
  );
};
