import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('charge');
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({
    disableErrorMessages: true,
    transform: true,
  }));
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1'
  });
  await app.listen(process.env.PORT);
}
bootstrap();
