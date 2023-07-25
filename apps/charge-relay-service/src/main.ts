import { NestFactory } from '@nestjs/core'
import { TcpOptions, Transport } from '@nestjs/microservices'
import { ChargeRelayServiceModule } from '@app/relay-service/charge-relay-service.module'

async function bootstrap () {
  const app = await NestFactory.create(ChargeRelayServiceModule)
  const microServiceOptions: TcpOptions = {
    transport: Transport.TCP,
    options: {
      host: process.env.RELAY_HOST,
      port: parseInt(process.env.RELAY_TCP_PORT)
    }
  }

  app.setGlobalPrefix('relay')

  app.connectMicroservice(microServiceOptions)
  await app.startAllMicroservices()
  await app.listen(process.env.RELAY_PORT)
}
bootstrap()
