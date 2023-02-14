import { Transport } from '@nestjs/microservices'
import { HttpAdapterHost, NestFactory } from '@nestjs/core'
import { ChargeApiServiceModule } from 'apps/charge-api-service/src/charge-api-service.module'
import { AllExceptionsFilter } from '@app/common/exceptions/all-exceptions.filter'
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common'
import { apiServiceLoggerContext } from '@app/common/constants/microservices.constants'

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

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true
    })
  )

  app.enableVersioning({
    type: VersioningType.URI
  })

  if (process.env.QA_MODE) {
    console.log('QA mode enabled with enableCors')
    app.enableCors()
  }

  const httpAdapterHost = app.get(HttpAdapterHost)
  const logger = new Logger(apiServiceLoggerContext)
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost, logger))
  app.connectMicroservice(microServiceOptions, { inheritAppConfig: true })

  await app.startAllMicroservices()

  await app.listen(process.env.API_PORT)
}
bootstrap()
