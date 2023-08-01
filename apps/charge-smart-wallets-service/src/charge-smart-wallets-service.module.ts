import { ChargeSmartWalletsServiceController } from '@app/smart-wallets-service/charge-smart-wallets-service.controller'
import { SmartWalletsModule } from '@app/smart-wallets-service/smart-wallets/smart-wallets.module'
import { Module } from '@nestjs/common'
import { DataLayerModule } from '@app/smart-wallets-service/data-layer/data-layer.module'

@Module({
  controllers: [ChargeSmartWalletsServiceController],
  imports: [SmartWalletsModule, DataLayerModule]
})
export class ChargeSmartWalletsServiceModule { }
