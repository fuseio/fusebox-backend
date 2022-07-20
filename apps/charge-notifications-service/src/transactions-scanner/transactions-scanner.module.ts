import { DatabaseModule } from '@app/common'
import { BroadcasterModule } from '@app/notifications-service/broadcaster/broadcaster.module'
import rpcConfig from '@app/notifications-service/common/config/rpc-config'
import { transactionsScannerProviders } from '@app/notifications-service/transactions-scanner/transactions-scanner.providers'
import { TransactionsScannerService } from '@app/notifications-service/transactions-scanner/transactions-scanner.service'
import Web3ProviderService from '@app/notifications-service/transactions-scanner/web3-provider.service'
import { Logger, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [
    DatabaseModule,
    ConfigModule.forFeature(rpcConfig),
    BroadcasterModule
  ],
  providers: [TransactionsScannerService, Web3ProviderService, ...transactionsScannerProviders, Logger]
})
export class TransactionsScannerModule {}
