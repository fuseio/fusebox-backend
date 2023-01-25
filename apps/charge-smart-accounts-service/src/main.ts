import { HttpAdapterHost, NestFactory } from '@nestjs/core'
import { Transport } from '@nestjs/microservices'
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common'
import { smartAccountsServiceLoggerContext } from '@app/common/constants/microservices.constants'
import { AllExceptionsFilter } from '@app/common/exceptions/all-exceptions.filter'
import { ChargeSmartAccountsServiceModule } from '@app/smart-accounts-service/charge-smart-accounts-service.module'

async function bootstrap () {
  const app = await NestFactory.create(ChargeSmartAccountsServiceModule)

  const microServiceOptions = {
    transpot: Transport.TCP,
    options: {
      host: process.env.SMART_ACCOUNTS_HOST,
      port: process.env.SMART_ACCOUNTS_TCP_PORT
    }
  }
  app.setGlobalPrefix('smart-accounts')
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
  const logger = new Logger(smartAccountsServiceLoggerContext)
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost, logger))
  app.connectMicroservice(microServiceOptions, { inheritAppConfig: true })

  await app.startAllMicroservices()

  await app.listen(process.env.SMART_ACCOUNTS_PORT)
}
bootstrap()
