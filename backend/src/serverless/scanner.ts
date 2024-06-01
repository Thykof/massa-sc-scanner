import { Handler, APIGatewayProxyEvent } from 'aws-lambda';
import {
  downloadWasm,
  downloadWat,
  scanSmartContract,
} from 'src/services/scanner';
import { headers } from './common';
import { config } from 'dotenv';
config();

export const handler: Handler = async (event: APIGatewayProxyEvent) => {
  console.log(`received event: ${JSON.stringify(event, undefined, 2)}`);

  const address = event.queryStringParameters?.address;
  const chainId = event.queryStringParameters?.chainId;
  const path = event.path;

  switch (path) {
    case '/scanner':
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(await scanSmartContract(address, chainId)),
      };
    case '/wat':
      return {
        statusCode: 200,
        headers: {
          ...headers,
          'Content-Disposition': `attachment; filename="${address}.wat"`,
          'Content-Type': 'text/plain',
        },
        body: (await downloadWat(address, chainId)).toString('base64'),
        isBase64Encoded: true,
      };
    case '/wasm':
      return {
        statusCode: 200,
        headers: {
          ...headers,
          'Content-Disposition': `attachment; filename="${address}.wasm"`,
          'Content-Type': 'application/octet-stream',
        },
        body: (await downloadWasm(address, chainId)).toString('base64'),
        isBase64Encoded: true,
      };
    default:
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ message: 'Not Found' }),
      };
  }
};
