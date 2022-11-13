import { BroadcasterService } from '@app/notifications-service/broadcaster/broadcaster.service'
import { WebhooksModule } from '@app/notifications-service/webhooks/webhooks.module'
import { HttpModule } from '@nestjs/axios'
import { Logger, Module } from '@nestjs/common'
import { webhookEventProviders } from '@app/notifications-service/common/providers/webhook-event.provider'
import { DatabaseModule } from '@app/common'
import { ConfigModule } from '@nestjs/config'
import configuration from '@app/notifications-service/broadcaster/config/configuration'

@Module({
  providers: [BroadcasterService, Logger, ...webhookEventProviders],
  imports: [DatabaseModule, WebhooksModule, HttpModule, ConfigModule.forFeature(configuration)],
  exports: [BroadcasterService]
})
export class BroadcasterModule {}
