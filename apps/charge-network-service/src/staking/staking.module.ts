import { Module } from '@nestjs/common'
import { StakingController } from '@app/network-service/staking/staking.controller'
import { StakingService } from '@app/network-service/staking/staking.service'
import { ConfigModule } from '@nestjs/config'
import configuration from 'apps/charge-network-service/src/common/config/configuration'
import Web3ProviderService from '@app/common/services/web3-provider.service'

@Module({
  imports: [
    ConfigModule.forFeature(configuration)
  ],
  controllers: [StakingController],
  providers: [StakingService, Web3ProviderService],
  exports: [StakingService]
})
export class StakingModule {}
