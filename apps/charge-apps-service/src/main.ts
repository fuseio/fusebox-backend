import { HttpAdapterHost, NestFactory } from '@nestjs/core'
import { ChargeAppsServiceModule } from '@app/apps-service/charge-apps-service.module'
import { TcpOptions, Transport } from '@nestjs/microservices'
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common'
import { appStoreServiceLoggerContext } from '@app/common/constants/microservices.constants'
import { AllExceptionsFilter } from '@app/common/exceptions/all-exceptions.filter'

async function bootstrap () {
  const app = await NestFactory.create(ChargeAppsServiceModule)

  const microServiceOptions: TcpOptions = {
    transport: Transport.TCP,
    options: {
      host: process.env.APPS_HOST,
      port: parseInt(process.env.APPS_TCP_PORT)
    }
  }
  app.setGlobalPrefix('app-store')
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
  const logger = new Logger(appStoreServiceLoggerContext)
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost, logger))
  app.connectMicroservice(microServiceOptions, { inheritAppConfig: true })

  await app.startAllMicroservices()

  await app.listen(process.env.APPS_PORT)
}
bootstrap()
