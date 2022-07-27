import { DatabaseModule } from '@app/common'
import { WebhooksController } from '@app/notifications-service/webhooks/webhooks.controller'
import { webhooksProviders } from '@app/notifications-service/webhooks/webhooks.providers'
import { WebhooksService } from '@app/notifications-service/webhooks/webhooks.service'
import { Module } from '@nestjs/common'

@Module({
  imports: [DatabaseModule],
  providers: [WebhooksService, ...webhooksProviders],
  controllers: [WebhooksController],
  exports: [WebhooksService]
})
export class WebhooksModule {}
