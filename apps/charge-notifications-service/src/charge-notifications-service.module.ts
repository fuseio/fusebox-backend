import { ChargeNotificationsServiceController } from '@app/notifications-service/charge-notifications-service.controller';
import { ChargeNotificationsService } from '@app/notifications-service/charge-notifications-service.service';
import { EventsScannerModule } from '@app/notifications-service/events-scanner/events-scanner.module';
import { WebhooksModule } from '@app/notifications-service/webhooks/webhooks.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [WebhooksModule, EventsScannerModule],
  controllers: [ChargeNotificationsServiceController],
  providers: [ChargeNotificationsService]
})
export class ChargeNotificationsServiceModule {}
