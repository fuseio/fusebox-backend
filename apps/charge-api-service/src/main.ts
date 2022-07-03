import { Transport } from '@nestjs/microservices'
import { HttpAdapterHost, NestFactory } from '@nestjs/core'
import { ChargeApiServiceModule } from 'apps/charge-api-service/src/charge-api-service.module'
import { AllExceptionsFilter } from '@app/common/exceptions/all-exceptions.filter'
import { Logger } from '@nestjs/common'
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

  app.connectMicroservice(microServiceOptions)
  await app.startAllMicroservices()

  const httpAdapterHost = app.get(HttpAdapterHost)
  const logger = new Logger(apiServiceLoggerContext)
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost, logger))

  await app.listen(process.env.API_PORT)
}
bootstrap()
