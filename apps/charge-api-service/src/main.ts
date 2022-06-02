import { Transport } from '@nestjs/microservices';
import { NestFactory } from '@nestjs/core';
import { ChargeApiServiceModule } from 'apps/charge-api-service/src/charge-api-service.module';

async function bootstrap() {
  const app = await NestFactory.create(ChargeApiServiceModule);

  const microServiceOptions = {
    transpot: Transport.TCP,
    options: {
      host: 'charge-api-service',
      port: process.env.API_TCP_PORT,
    },
  };

  app.connectMicroservice(microServiceOptions);
  await app.startAllMicroservices();
  await app.listen(process.env.API_PORT);
}
bootstrap();
