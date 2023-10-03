import { SmartWalletsAPIModule } from '@app/api-service/smart-wallets-api/smart-wallets-api.module'
import { BroadcasterModule } from '@app/notifications-service/broadcaster/broadcaster.module'
import { ChargeNotificationsServiceController } from '@app/notifications-service/charge-notifications-service.controller'
import { EventsScannerModule } from '@app/notifications-service/events-scanner/events-scanner.module'
import { TransactionsScannerModule } from '@app/notifications-service/transactions-scanner/transactions-scanner.module'
import { WebhooksModule } from '@app/notifications-service/webhooks/webhooks.module'
import { Module } from '@nestjs/common'

@Module({
  imports: [WebhooksModule, EventsScannerModule, TransactionsScannerModule, BroadcasterModule, SmartWalletsAPIModule],
  controllers: [ChargeNotificationsServiceController]
})
export class ChargeNotificationsServiceModule { }
