import { ChargeSmartWalletsServiceController } from '@app/smart-wallets-service/charge-smart-wallets-service.controller'
import { SmartWalletsModule } from '@app/smart-wallets-service/smart-wallets/smart-wallets.module'
import { Module } from '@nestjs/common'

@Module({
  controllers: [ChargeSmartWalletsServiceController],
  imports: [SmartWalletsModule]
})
export class ChargeSmartWalletsServiceModule {}
