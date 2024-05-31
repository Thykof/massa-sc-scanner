import { Handler, APIGatewayProxyEvent } from 'aws-lambda';
import { scanSmartContract } from 'src/services/scanner';

export const handler: Handler = async (event: APIGatewayProxyEvent) => {
  console.log(`received event: ${JSON.stringify(event)}`);

  const result = await scanSmartContract(
    event.queryStringParameters?.address,
    event.queryStringParameters?.chainId,
  );

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: result,
  };
};
