import { Handler, APIGatewayProxyEvent } from 'aws-lambda';
import { downloadZip, verified, verify } from 'src/services/verifier';
import * as parser from 'lambda-multipart-parser';
import { headers } from './common';
import { ZIP_MIME_TYPE } from 'src/const';
import { config } from 'dotenv';
config();

export const handler: Handler = async (event: APIGatewayProxyEvent) => {
  console.log('received event');

  const address = event.queryStringParameters?.address;
  const chainId = event.queryStringParameters?.chainId;
  const path = event.path;

  switch (path) {
    case '/verified':
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(await verified(address)),
      };
    case '/verify':
      const result = await parser.parse(event);
      if (result.files.length === 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: 'No file uploaded' }),
        };
      }
      const file = result.files[0];
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(
          await verify(result.address, result.chainIdString, {
            buffer: file.content,
            size: file.content.length,
            mimetype: file.contentType,
          }),
        ),
      };
    case '/zip':
      return {
        statusCode: 200,
        headers: {
          ...handler,
          'Content-Disposition': `attachment; filename="${address}.zip"`,
          'Content-Type': ZIP_MIME_TYPE,
        },
        body: (await downloadZip(address, chainId)).toString('base64'),
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
