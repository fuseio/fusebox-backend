import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { ApiKeyModule } from '@app/api-service/api-keys/api-keys.module'
import { ConfigModule } from '@nestjs/config'
import configuration from '@app/api-service/bundler-api/config/configuration'
import { BundlerApiController } from '@app/api-service/bundler-api/bundler-api.controller'
import { ClientsModule } from '@nestjs/microservices'
import { tcpClient } from '@app/common/utils/tcp-transport'
import { smartWalletsService } from '@app/common/constants/microservices.constants'
import { OperatorsModule } from '@app/accounts-service/operators/operators.module'

@Module({
  imports: [
    ApiKeyModule,
    ClientsModule.register([
      tcpClient(smartWalletsService, process.env.SMART_WALLETS_HOST, process.env.SMART_WALLETS_TCP_PORT)
    ]),
    HttpModule,
    ConfigModule.forFeature(configuration),
    OperatorsModule
  ],
  controllers: [
    BundlerApiController
  ]
})

export class BundlerApiModule { }
