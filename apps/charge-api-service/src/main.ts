import { Transport } from '@nestjs/microservices'
import { NestFactory } from '@nestjs/core'
import { ChargeApiServiceModule } from 'apps/charge-api-service/src/charge-api-service.module'

async function bootstrap () {
  const app = await NestFactory.create(ChargeApiServiceModule)

  const microServiceOptions = {
    transpot: Transport.TCP,
    options: {
      host: process.env.API_HOST,
      port: process.env.API_TCP_PORT
    }
  }
  app.setGlobalPrefix('api')

  app.connectMicroservice(microServiceOptions)
  await app.startAllMicroservices()
  await app.listen(process.env.API_PORT)
}
bootstrap()
