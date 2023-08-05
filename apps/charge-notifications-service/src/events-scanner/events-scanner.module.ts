import { DatabaseModule } from '@app/common'
import { BroadcasterModule } from '@app/notifications-service/broadcaster/broadcaster.module'
import rpcConfig from '@app/notifications-service/common/config/rpc-config'
import { eventsScannerProviders } from '@app/notifications-service/events-scanner/events-scanner.providers'
import { UserOpEventsScannerService } from '@app/notifications-service/events-scanner/userop-events-scanner.service'
// import { ERC20EventsScannerService, userOpEventsScannerService } from '@app/notifications-service/events-scanner/userop-events-scanner.service'

import { Logger, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { EthersModule } from 'nestjs-ethers'
import { webhookEventProviders } from '@app/notifications-service/common/providers/webhook-event.provider'
import { WebhooksModule } from '@app/notifications-service/webhooks/webhooks.module'

@Module({
  imports: [
    EthersModule.forRootAsync({
      imports: [ConfigModule.forFeature(rpcConfig)],
      inject: [ConfigService],
      token: 'regular-node',
      useFactory: async (configService: ConfigService) => {
        const config = configService.get('rpcConfig')
        console.log('Rpc config ' + JSON.stringify(config))
        return {
          network: { name: config.rpc.networkName, chainId: config.rpc.chainId },
          custom: config.rpc.url,
          useDefaultProvider: false
        }
      }
    }),
    WebhooksModule,
    DatabaseModule,
    ConfigModule.forFeature(rpcConfig),
    BroadcasterModule
  ],
  providers: [UserOpEventsScannerService, ...eventsScannerProviders, ...webhookEventProviders, Logger]
})
export class EventsScannerModule {}
