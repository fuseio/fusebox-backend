import { Module } from '@nestjs/common';
import { ChargeAppsServiceController } from '@app/apps-service/charge-apps-service.controller';
import { ChargeAppsServiceService } from '@app/apps-service/charge-apps-service.service';

@Module({
  imports: [],
  controllers: [ChargeAppsServiceController],
  providers: [ChargeAppsServiceService],
})
export class ChargeAppsServiceModule {}
