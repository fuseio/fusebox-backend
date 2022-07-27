import { Transport } from '@nestjs/microservices'
import { HttpAdapterHost, NestFactory } from '@nestjs/core'
import { ChargeNotificationsServiceModule } from 'apps/charge-notifications-service/src/charge-notifications-service.module'
import { AllExceptionsFilter } from '@app/common/exceptions/all-exceptions.filter'
import { Logger, ValidationPipe } from '@nestjs/common'
import { notificationsServiceLoggerContext } from '@app/common/constants/microservices.constants'

async function bootstrap () {
  const app = await NestFactory.create(ChargeNotificationsServiceModule)

  const microServiceOptions = {
    transpot: Transport.TCP,
    options: {
      host: process.env.NOTIFICATIONS_HOST,
      port: process.env.NOTIFICATIONS_TCP_PORT
    }
  }
  app.setGlobalPrefix('notifications')

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true
    })
  )

  const httpAdapterHost = app.get(HttpAdapterHost)
  const logger = new Logger(notificationsServiceLoggerContext)
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost, logger))
  app.connectMicroservice(microServiceOptions, { inheritAppConfig: true })

  await app.startAllMicroservices()

  await app.listen(process.env.NOTIFICATIONS_PORT)
}
bootstrap()
