import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { ApiKeyModule } from '@app/api-service/api-keys/api-keys.module'
import { ConfigModule } from '@nestjs/config'
import configuration from '@app/api-service/paymaster-api/config/configuration'
import { PaymasterApiController } from '@app/api-service/paymaster-api/paymaster-api.controller'
import { PaymasterApiService } from '@app/api-service/paymaster-api/paymaster-api.service'
import { accountsService } from '@app/common/constants/microservices.constants'
import { ClientsModule, Transport } from '@nestjs/microservices'
import PaymasterWeb3ProviderService from '@app/common/services/paymaster-web3-provider.service'
import { UserOpParser } from '@app/common/services/user-op-parser.service'

@Module({
  imports: [
    ApiKeyModule,
    HttpModule,
    ConfigModule.forFeature(configuration),
    ClientsModule.register([
      {
        name: accountsService,
        transport: Transport.TCP,
        options: {
          host: process.env.ACCOUNTS_HOST,
          port: parseInt(process.env.ACCOUNTS_TCP_PORT)
        }
      }
    ])
  ],
  controllers: [
    PaymasterApiController
  ],
  providers: [PaymasterApiService, PaymasterWeb3ProviderService, UserOpParser]
})

export class PaymasterApiModule { }
