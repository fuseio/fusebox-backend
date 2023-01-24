import { ChargeSmartAccountsServiceController } from '@app/smart-accounts-service/charge-smart-accounts-service.controller'
import { SmartAccountsModule } from '@app/smart-accounts-service/smart-accounts/smart-accounts.module'
import { Module } from '@nestjs/common'

@Module({
  controllers: [ChargeSmartAccountsServiceController],
  imports: [SmartAccountsModule]
})
export class ChargeSmartAccountsServiceModule {}
