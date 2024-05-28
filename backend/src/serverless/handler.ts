import { NestFactory } from '@nestjs/core';
import serverlessExpress from '@codegenie/serverless-express';
import { Callback, Context, Handler } from 'aws-lambda';
import { AppModule } from '../app.module';

let server: Handler;

async function bootstrap(): Promise<Handler> {
  const app = await NestFactory.create(AppModule);
  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  server = server ?? (await bootstrap());
  return server(event, context, callback);
};

// http://localhost:3000/dev/AS12hStDpEvrzsu43j5g5fqSGeiW3EU9BUaGCJLiwoTS4KMqzPHMr/verified?chainIdString=77658366
// http://localhost:3000/dev/AS12hStDpEvrzsu43j5g5fqSGeiW3EU9BUaGCJLiwoTS4KMqzPHMr/inspect?chainIdString=77658366
