import { Module } from '@nestjs/common'
import { ChargeNetworkServiceController } from '@app/network-service/charge-network-service.controller'
import { StakingModule } from '@app/network-service/staking/staking.module'
import { HttpModule } from '@nestjs/axios'
import { GraphqlModule } from '@app/network-service/graphql/graphql.module'
import { ConsensusModule } from '@app/network-service/consensus/consensus.module'
import { BalancesModule } from './balances/balances.module'
import { TokenModule } from '@app/common/token/token.module'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [
    StakingModule,
    HttpModule,
    GraphqlModule,
    ConsensusModule,
    BalancesModule,
    ConfigModule,
    TokenModule
  ],
  controllers: [ChargeNetworkServiceController]
})
export class ChargeNetworkServiceModule { }
