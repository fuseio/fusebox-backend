import { Module } from '@nestjs/common';
import { ChargeNotificationsServiceController } from './charge-notifications-service.controller';
import { ChargeNotificationsServiceService } from './charge-notifications-service.service';

@Module({
  imports: [],
  controllers: [ChargeNotificationsServiceController],
  providers: [ChargeNotificationsServiceService],
})
export class ChargeNotificationsServiceModule {}
