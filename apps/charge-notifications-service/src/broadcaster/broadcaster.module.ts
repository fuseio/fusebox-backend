import { BroadcasterService } from '@app/notifications-service/broadcaster/broadcaster.service'
import { WebhooksModule } from '@app/notifications-service/webhooks/webhooks.module'
import { HttpModule } from '@nestjs/axios'
import { Logger, Module } from '@nestjs/common'

@Module({
  providers: [BroadcasterService, Logger],
  imports: [WebhooksModule, HttpModule],
  exports: [BroadcasterService]
})
export class BroadcasterModule {}
