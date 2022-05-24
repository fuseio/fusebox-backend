import { NestFactory } from '@nestjs/core';
import { ChargePaymentsModule } from './charge-payments.module';

async function bootstrap() {
  const app = await NestFactory.create(ChargePaymentsModule);
  await app.listen(3000);
}
bootstrap();
