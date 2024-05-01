import { DatabaseModule } from '@app/common'
import { BroadcasterModule } from '@app/notifications-service/broadcaster/broadcaster.module'
import rpcConfig from '@app/notifications-service/common/config/rpc-config'
import { transactionsScannerProviders } from '@app/notifications-service/transactions-scanner/transactions-scanner.providers'
import { TransactionsScannerService } from '@app/notifications-service/transactions-scanner/transactions-scanner.service'
import { Logger, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { EthersModule } from 'nestjs-ethers'
import { webhookEventProviders } from '@app/notifications-service/common/providers/webhook-event.provider'
import { WebhooksModule } from '@app/notifications-service/webhooks/webhooks.module'
import { GasService } from '@app/common/services/gas.service'

@Module({
  imports: [
    EthersModule.forRootAsync({
      imports: [ConfigModule.forFeature(rpcConfig)],
      inject: [ConfigService],
      token: 'full-archive-node',
      useFactory: async (configService: ConfigService) => {
        const config = configService.get('rpcConfig')
        return {
          network: { name: config.rpc.networkName, chainId: config.rpc.chainId },
          custom: config.fullArchiveRpc.url,
          useDefaultProvider: false
        }
      }
    }),
    WebhooksModule,
    DatabaseModule,
    ConfigModule.forFeature(rpcConfig),
    BroadcasterModule
  ],
  providers: [
    GasService,
    TransactionsScannerService,
    ...transactionsScannerProviders,
    ...webhookEventProviders,
    Logger
  ]
})
export class TransactionsScannerModule { }
