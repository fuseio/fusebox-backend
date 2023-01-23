import { ChargeSmartAccountsServiceController } from '@app/smart-accounts-service/charge-smart-accounts-service.controller';
import { ChargeSmartAccountsService } from '@app/smart-accounts-service/charge-smart-accounts-service.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [ChargeSmartAccountsServiceController],
  providers: [ChargeSmartAccountsService],
})
export class ChargeSmartAccountsServiceModule {}
