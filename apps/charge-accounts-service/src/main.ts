import { NestFactory } from '@nestjs/core';
import { AppModule } from '@app/accounts-service/app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import Helmet from 'helmet';
import { Transport } from '@nestjs/microservices';
import { accountsServiceHost } from '@app/common/constants/microservices.constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice({
    transport: Transport.TCP,
    options: {
      retryAttempts: 5,
      retryDelay: 3000,
      host: accountsServiceHost,
      port: process.env.ACCOUNTS_TCP_PORT,
    },
  });

  await app.startAllMicroservices();
  app.use(Helmet());
  app.setGlobalPrefix('accounts');
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      disableErrorMessages: true,
      transform: true,
    }),
  );
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  await app.listen(process.env.ACCOUNTS_PORT);
}
bootstrap();
