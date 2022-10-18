import { NestFactory } from '@nestjs/core';
import { ChargeAppsServiceModule } from './charge-apps-service.module';

async function bootstrap() {
  const app = await NestFactory.create(ChargeAppsServiceModule);
  await app.listen(3000);
}
bootstrap();
