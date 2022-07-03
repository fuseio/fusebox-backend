import { HttpAdapterHost, NestFactory } from '@nestjs/core'
import { AppModule } from '@app/accounts-service/app.module'
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common'
import Helmet from 'helmet'
import { Transport } from '@nestjs/microservices'
import { AllExceptionsFilter } from '@app/common/exceptions/all-exceptions.filter'
import { accountsServiceLoggerContext } from '@app/common/constants/microservices.constants'

async function bootstrap () {
  const app = await NestFactory.create(AppModule)

  app.connectMicroservice({
    transport: Transport.TCP,
    options: {
      retryAttempts: 5,
      retryDelay: 3000,
      host: process.env.ACCOUNTS_HOST,
      port: process.env.ACCOUNTS_TCP_PORT
    }
  })

  await app.startAllMicroservices()
  app.use(Helmet())
  app.setGlobalPrefix('accounts')
  app.enableCors()
  app.useGlobalPipes(
    new ValidationPipe({
      disableErrorMessages: true,
      transform: true
    })
  )
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1'
  })

  const httpAdapterHost = app.get(HttpAdapterHost)
  const logger = new Logger(accountsServiceLoggerContext)
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost, logger))

  await app.listen(process.env.ACCOUNTS_PORT)
}
bootstrap()
