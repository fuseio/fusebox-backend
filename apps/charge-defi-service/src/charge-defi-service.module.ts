import { Module } from '@nestjs/common'
import { StakingModule } from 'apps/charge-defi-service/src/staking/staking.module'
import { ChargeDeFiServiceController } from 'apps/charge-defi-service/src/charge-defi-service.controller'

@Module({
  imports: [StakingModule],
  controllers: [ChargeDeFiServiceController]
})
export class ChargeDeFiServiceModule {}
