import { Handler, APIGatewayProxyEvent } from 'aws-lambda';

export const handler: Handler = async (event: APIGatewayProxyEvent) => {
  console.log(`received event: ${JSON.stringify(event)}`);

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: {},
  };
};
