import { ChargeApiServiceController } from '@app/api-service/charge-api-service.controller'
import { ChargeApiServiceService } from '@app/api-service/charge-api-service.service'
import { LegacyApiModule } from '@app/api-service/legacy-api/legacy-api.module'
import { Module } from '@nestjs/common'
import { ApiKeyModule } from '@app/api-service/api-keys/api-keys.module'
import { NotificationsModule } from '@app/api-service/notifications/notifications.module'
import { StakingAPIModule } from '@app/api-service/staking-api/staking-api.module'
import { ExplorerApiModule } from '@app/api-service/explorer-api/explorer-api.module'
import { SmartAccountsAPIModule } from '@app/api-service/smart-accounts/smart-accounts-api.module'

@Module({
  imports: [
    ApiKeyModule,
    LegacyApiModule,
    NotificationsModule,
    StakingAPIModule,
    ExplorerApiModule,
    SmartAccountsAPIModule
  ],
  controllers: [ChargeApiServiceController],
  providers: [ChargeApiServiceService]
})
export class ChargeApiServiceModule {}
