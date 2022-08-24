import { Transport } from '@nestjs/microservices'
import { HttpAdapterHost, NestFactory } from '@nestjs/core'
import { ChargeDeFiServiceModule } from 'apps/charge-defi-service/src/charge-defi-service.module'
import { Logger, ValidationPipe } from '@nestjs/common'
import { defiServiceContext } from '@app/common/constants/microservices.constants'
import { AllExceptionsFilter } from '@app/common/exceptions/all-exceptions.filter'

async function bootstrap () {
  const app = await NestFactory.create(ChargeDeFiServiceModule)
  const microServiceOptions = {
    transpot: Transport.TCP,
    options: {
      host: process.env.DEFI_HOST,
      port: process.env.DEFI_TCP_PORT
    }
  }
  app.setGlobalPrefix('defi')

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true
    })
  )

  const httpAdapterHost = app.get(HttpAdapterHost)
  const logger = new Logger(defiServiceContext)
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost, logger))

  app.connectMicroservice(microServiceOptions, { inheritAppConfig: true })

  await app.startAllMicroservices()

  await app.listen(process.env.DEFI_PORT)
}
bootstrap()
