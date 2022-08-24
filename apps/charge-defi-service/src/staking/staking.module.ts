import { Module } from '@nestjs/common'
import { StakingController } from 'apps/charge-defi-service/src/staking/staking.controller'
import { StakingService } from 'apps/charge-defi-service/src/staking/staking.service'
import { ConfigModule } from '@nestjs/config'
import Web3ProviderService from '@app/common/services/web3-provider.service'
import configuration from 'apps/charge-defi-service/src/common/config/configuration'

@Module({
  imports: [
    ConfigModule.forFeature(configuration)
  ],
  controllers: [StakingController],
  providers: [StakingService, Web3ProviderService],
  exports: [StakingService]
})
export class StakingModule { }
