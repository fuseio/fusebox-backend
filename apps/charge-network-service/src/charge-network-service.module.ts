import { Module } from '@nestjs/common'
import { ChargeNetworkServiceController } from '@app/network-service/charge-network-service.controller'
import { StakingModule } from '@app/network-service/staking/staking.module'
import { HttpModule } from '@nestjs/axios'
import { GraphqlModule } from '@app/network-service/graphql/graphql.module'
import { ConsensusModule } from '@app/network-service/consensus/consensus.module'

@Module({
  imports: [
    StakingModule,
    HttpModule,
    GraphqlModule,
    ConsensusModule
  ],
  controllers: [ChargeNetworkServiceController]
})
export class ChargeNetworkServiceModule { }
