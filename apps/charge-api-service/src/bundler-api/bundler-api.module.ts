import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { ApiKeyModule } from '@app/api-service/api-keys/api-keys.module'
import { ConfigModule } from '@nestjs/config'
import configuration from '@app/api-service/bundler-api/config/configuration'
import { BundlerApiControllerV0 } from '@app/api-service/bundler-api/bundler-api-v0.controller'
import { BundlerApiControllerV07 } from '@app/api-service/bundler-api/bundler-api-v0.7.controller'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { smartWalletsService } from '@app/common/constants/microservices.constants'

@Module({
  imports: [
    ApiKeyModule,
    ClientsModule.register([
      {
        name: smartWalletsService,
        transport: Transport.TCP,
        options: {
          host: process.env.SMART_WALLETS_HOST,
          port: parseInt(process.env.SMART_WALLETS_TCP_PORT)
        }
      }
    ]),
    HttpModule,
    ConfigModule.forFeature(configuration)
  ],
  controllers: [
    BundlerApiControllerV0,
    BundlerApiControllerV07
  ]
})

export class BundlerApiModule { }
