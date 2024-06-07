import { Handler, APIGatewayProxyEvent } from 'aws-lambda';
import {
  downloadWasm,
  downloadWat,
  scanFromMassexplo,
  scanSmartContract,
} from 'src/services/scanner';
import { headers } from './common';
import { config } from 'dotenv';
config();

export const handler: Handler = async (event: APIGatewayProxyEvent) => {
  console.log(`received event: ${JSON.stringify(event, undefined, 2)}`);

  const address = event.queryStringParameters?.address;
  const chainId = event.queryStringParameters?.chainId;
  const opId = event.queryStringParameters?.opId;
  const path = event.path;

  try {
    switch (path) {
      case '/scanner':
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(await scanSmartContract(address, chainId)),
        };
      case '/scan-from-massexplo':
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(await scanFromMassexplo(opId, chainId)),
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
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Internal error' }),
    };
  }
};
