import { DatabaseModule } from '@app/common'
import { WebhooksController } from '@app/notifications-service/webhooks/webhooks.controller'
import { webhooksProviders } from '@app/notifications-service/webhooks/webhooks.providers'
import { WebhooksService } from '@app/notifications-service/webhooks/webhooks.service'
import { Module } from '@nestjs/common'
import { webhookEventProviders } from '@app/notifications-service/common/providers/webhook-event.provider'

@Module({
  imports: [DatabaseModule],
  providers: [WebhooksService, ...webhooksProviders, ...webhookEventProviders],
  controllers: [WebhooksController],
  exports: [WebhooksService]
})
export class WebhooksModule {}
