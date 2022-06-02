import { NestFactory } from '@nestjs/core'
import { Transport } from '@nestjs/microservices'
import { ChargeRelayServiceModule } from './charge-relay-service.module'
import { relayServiceHost } from '@app/common/constants/microservices.constants'

async function bootstrap () {
  const app = await NestFactory.create(ChargeRelayServiceModule)
  const microServiceOptions = {
    transpot: Transport.TCP,
    options: {
      host: relayServiceHost,
      port: process.env.RELAY_TCP_PORT
    }
  }

  app.connectMicroservice(microServiceOptions)
  await app.startAllMicroservices()
  await app.listen(process.env.RELAY_PORT)
}
bootstrap()
