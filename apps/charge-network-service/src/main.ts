import { TcpOptions } from '@nestjs/microservices'
import { tcpServer } from '@app/common/utils/tcp-transport'
import { HttpAdapterHost, NestFactory } from '@nestjs/core'
import { ChargeNetworkServiceModule } from '@app/network-service/charge-network-service.module'
import { Logger, ValidationPipe } from '@nestjs/common'
import { networkServiceLoggerContext } from '@app/common/constants/microservices.constants'
import { AllExceptionsFilter } from '@app/common/exceptions/all-exceptions.filter'

async function bootstrap () {
  const app = await NestFactory.create(ChargeNetworkServiceModule)
  const microServiceOptions: TcpOptions = tcpServer(process.env.NETWORK_HOST, process.env.NETWORK_TCP_PORT)
  app.setGlobalPrefix('network')

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true
    })
  )

  const httpAdapterHost = app.get(HttpAdapterHost)
  const logger = new Logger(networkServiceLoggerContext)
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost, logger))

  app.connectMicroservice(microServiceOptions, { inheritAppConfig: true })

  await app.startAllMicroservices()

  await app.listen(process.env.NETWORK_PORT)
}
bootstrap()
