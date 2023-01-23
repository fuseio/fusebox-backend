import { ChargeSmartAccountsServiceController } from '@app/smart-accounts-service/charge-smart-accounts-service.controller';
import { Module } from '@nestjs/common';

@Module({
  controllers: [ChargeSmartAccountsServiceController],
})
export class ChargeSmartAccountsServiceModule {}
