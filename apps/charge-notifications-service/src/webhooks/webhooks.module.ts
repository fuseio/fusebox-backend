import { DatabaseModule } from '@app/common'
import { WebhooksController } from '@app/notifications-service/webhooks/webhooks.controller'
import { webhooksProviders } from '@app/notifications-service/webhooks/webhooks.providers'
import { WebhooksService } from '@app/notifications-service/webhooks/webhooks.service'
import { Module } from '@nestjs/common'
import { webhookEventProviders } from '@app/notifications-service/common/providers/webhook-event.provider'
import { ConfigModule } from '@nestjs/config'
import configuration from './config/configuration'
import { WebhookEventsQueueModule } from '@app/common/modules/webhook-events-queue.module'

@Module({
  imports: [
    DatabaseModule,
    ConfigModule.forFeature(configuration),
    WebhookEventsQueueModule
  ],
  providers: [WebhooksService, ...webhooksProviders, ...webhookEventProviders],
  controllers: [WebhooksController],
  exports: [WebhooksService]
})
export class WebhooksModule { }
