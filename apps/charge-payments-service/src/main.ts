import { Transport } from '@nestjs/microservices';
import { NestFactory } from '@nestjs/core';
import { ChargePaymentsServiceModule } from './charge-payments-service.module';

async function bootstrap() {
  const app = await NestFactory.create(ChargePaymentsServiceModule);

  const microServiceOptions = {
    transpot: Transport.TCP,
    options: {
      host: 'charge-payments-service',
      port: process.env.PAYMENTS_TCP_PORT,
    },
  };

  app.connectMicroservice(microServiceOptions);
  await app.startAllMicroservices();
  await app.listen(process.env.PAYMENTS_PORT);
}
bootstrap();
