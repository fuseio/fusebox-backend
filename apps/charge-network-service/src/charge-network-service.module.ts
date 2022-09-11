import { Module } from '@nestjs/common'
import { ChargeNetworkServiceController } from '@app/network-service/charge-network-service.controller'
import { StakingModule } from '@app/network-service/staking/staking.module'
import { HttpModule } from '@nestjs/axios'

@Module({
  imports: [StakingModule, HttpModule],
  controllers: [ChargeNetworkServiceController]
})
export class ChargeNetworkServiceModule {}
