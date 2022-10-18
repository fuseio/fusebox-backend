import { Module } from '@nestjs/common'
import { ChargeAppsServiceController } from '@app/apps-service/charge-apps-service.controller'
import { ChargeAppsServiceService } from '@app/apps-service/charge-apps-service.service'
import { ApiKeysModule } from '@app/apps-service/api-keys/api-keys.module'

@Module({
  imports: [ApiKeysModule],
  controllers: [ChargeAppsServiceController],
  providers: [ChargeAppsServiceService]
})
export class ChargeAppsServiceModule {}
