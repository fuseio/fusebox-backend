import { Module } from '@nestjs/common';
import { ChargeAppsServiceController } from './charge-apps-service.controller';
import { ChargeAppsServiceService } from './charge-apps-service.service';

@Module({
  imports: [],
  controllers: [ChargeAppsServiceController],
  providers: [ChargeAppsServiceService],
})
export class ChargeAppsServiceModule {}
