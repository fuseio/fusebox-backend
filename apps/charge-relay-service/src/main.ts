import { NestFactory } from '@nestjs/core'
import { TcpOptions } from '@nestjs/microservices'
import { tcpServer } from '@app/common/utils/tcp-transport'
import { ChargeRelayServiceModule } from '@app/relay-service/charge-relay-service.module'

async function bootstrap () {
  const app = await NestFactory.create(ChargeRelayServiceModule)
  const microServiceOptions: TcpOptions = tcpServer(process.env.RELAY_HOST, process.env.RELAY_TCP_PORT)

  app.setGlobalPrefix('relay')

  app.connectMicroservice(microServiceOptions)
  await app.startAllMicroservices()
  await app.listen(process.env.RELAY_PORT)
}
bootstrap()
