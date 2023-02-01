import { HttpAdapterHost, NestFactory } from '@nestjs/core'
import { Transport } from '@nestjs/microservices'
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common'
import { smartWalletsServiceLoggerContext } from '@app/common/constants/microservices.constants'
import { AllExceptionsFilter } from '@app/common/exceptions/all-exceptions.filter'
import { ChargeSmartWalletsServiceModule } from '@app/smart-wallets-service/charge-smart-wallets-service.module'

async function bootstrap () {
  const app = await NestFactory.create(ChargeSmartWalletsServiceModule)

  const microServiceOptions = {
    transpot: Transport.TCP,
    options: {
      host: process.env.SMART_WALLETS_HOST,
      port: process.env.SMART_WALLETS_TCP_PORT
    }
  }
  app.setGlobalPrefix('smart-wallets')
  app.enableCors()

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true
    })
  )

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1'
  })

  const httpAdapterHost = app.get(HttpAdapterHost)
  const logger = new Logger(smartWalletsServiceLoggerContext)
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost, logger))
  app.connectMicroservice(microServiceOptions, { inheritAppConfig: true })

  await app.startAllMicroservices()

  await app.listen(process.env.SMART_WALLETS_PORT)
}
bootstrap()
