import { Handler, APIGatewayProxyEvent } from 'aws-lambda';
import { downloadZip, isVerified, verify } from 'src/services/verifier';
import { headers } from './common';
import { ZIP_MIME_TYPE } from 'src/const';
import { config } from 'dotenv';
config();

export const handler: Handler = async (event: APIGatewayProxyEvent) => {
  const address = event.queryStringParameters?.address;
  const chainId = event.queryStringParameters?.chainId;
  const path = event.path;

  console.log('received event', path);

  switch (path) {
    case '/verified':
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          sourceCodeValid: await isVerified(address, chainId),
        }),
      };
    case '/verify':
      const body = event.body ? JSON.parse(event.body) : {};
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(
          await verify(body.address, body.chainId, {
            buffer: Buffer.from(
              Object.values(body.zipData as { [key: string]: number }),
            ),
            size: body.zipData.length,
            mimetype: ZIP_MIME_TYPE,
          }),
        ),
      };
    case '/zip':
      return {
        statusCode: 200,
        headers: {
          ...headers,
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
