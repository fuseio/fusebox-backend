import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { ApiKeyModule } from '@app/api-service/api-keys/api-keys.module'
import { ConfigModule, ConfigService } from '@nestjs/config'
import configuration from '@app/api-service/paymaster-api/config/configuration'
import { PaymasterApiController } from '@app/api-service/paymaster-api/paymaster-api.controller'
import { PaymasterApiService } from '@app/api-service/paymaster-api/paymaster-api.service'
import { accountsService } from '@app/common/constants/microservices.constants'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { EthersModule } from 'nestjs-ethers'
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
    ]),
    EthersModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      token: 'fuse',
      useFactory: async (configService: ConfigService) => {
        const config = configService.get('paymasterApi')
        const { production } = config
        const { url, networkName, chainId } = production
        return {
          network: { name: networkName, chainId },
          custom: url,
          useDefaultProvider: false
        }
      }
    }),
    EthersModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      token: 'fuseSpark',
      useFactory: async (configService: ConfigService) => {
        const config = configService.get('paymasterApi')
        const { sandbox } = config
        const { url, networkName, chainId } = sandbox
        return {
          network: { name: networkName, chainId },
          custom: url,
          useDefaultProvider: false
        }
      }
    })
  ],
  controllers: [
    PaymasterApiController
  ],
  providers: [
    PaymasterApiService,
    UserOpParser
  ]
})

export class PaymasterApiModule { }
