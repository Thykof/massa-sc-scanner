import { NestFactory } from '@nestjs/core';
import serverlessExpress from '@codegenie/serverless-express';
import { Callback, Context, Handler } from 'aws-lambda';
import cors from 'cors';
import middy from 'middy';
import { cors as middyCors } from 'middy/middlewares';
import { AppModule } from '../app.module';

let server: Handler;

async function bootstrap(): Promise<Handler> {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
  });
  app.use(cors());
  app.use(middyCors());
  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.use(cors());
  expressApp.use(middyCors());
  return serverlessExpress({ app: expressApp });
}

const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  context.callbackWaitsForEmptyEventLoop = false;
  server = server ?? (await bootstrap());
  return server(event, context, callback);
};

const handlerDecorated = middy(handler).use(middyCors());

export { handlerDecorated };

// http://localhost:3000/dev/AS12hStDpEvrzsu43j5g5fqSGeiW3EU9BUaGCJLiwoTS4KMqzPHMr/verified?chainIdString=77658366
// http://localhost:3000/dev/AS12hStDpEvrzsu43j5g5fqSGeiW3EU9BUaGCJLiwoTS4KMqzPHMr/inspect?chainIdString=77658366

// https://5bekus8ou8.execute-api.us-east-1.amazonaws.com/dev/AS12Ghnpk1SAobePQMG1kU9fTjebPLd1EqFLXQv8rFU2HV2xhVbwg/verified?chainIdString=77658366
