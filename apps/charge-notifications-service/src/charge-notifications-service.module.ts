import { Module } from '@nestjs/common'
import { ChargeNotificationsServiceController } from '@app/notifications-service/charge-notifications-service.controller'
import { ChargeNotificationsServiceService } from '@app/notifications-service/charge-notifications-service.service'
import { WebhooksModule } from '@app/notifications-service/webhooks/webhooks.module'

@Module({
  imports: [WebhooksModule],
  controllers: [ChargeNotificationsServiceController],
  providers: [ChargeNotificationsServiceService]
})
export class ChargeNotificationsServiceModule {}
