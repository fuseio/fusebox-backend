import { ChargeApiServiceController } from '@app/api-service/charge-api-service.controller'
import { ChargeApiServiceService } from '@app/api-service/charge-api-service.service'
import { LegacyApiModule } from '@app/api-service/legacy-api/legacy-api.module'
import { Module } from '@nestjs/common'
import { ApiKeyModule } from '@app/api-service/api-keys/api-keys.module'
import { NotificationsModule } from '@app/api-service/notifications/notifications.module'
import { StakingAPIModule } from '@app/api-service/staking-api/staking-api.module'

@Module({
  imports: [ApiKeyModule, LegacyApiModule, NotificationsModule, StakingAPIModule],
  controllers: [ChargeApiServiceController],
  providers: [ChargeApiServiceService]
})
export class ChargeApiServiceModule { }
