import { Module } from '@nestjs/common'
import { StakingController } from '@app/network-service/staking/staking.controller'
import { StakingService } from '@app/network-service/staking/staking.service'
import { ConfigModule } from '@nestjs/config'
import configuration from 'apps/charge-network-service/src/common/config/configuration'
import Web3ProviderService from '@app/common/services/web3-provider.service'
import VoltBarService from './staking-providers/volt-bar.service'
import GraphService from '@app/network-service/staking/graph.service'
import TradeService from '@app/common/services/trade.service'
import { HttpModule } from '@nestjs/axios'

@Module({
  imports: [
    ConfigModule.forFeature(configuration),
    HttpModule
  ],
  controllers: [StakingController],
  providers: [StakingService, VoltBarService, Web3ProviderService, GraphService, TradeService],
  exports: [StakingService]
})
export class StakingModule {}
