import { BalancesModule } from '@app/network-service/balances/balances.module'
import { ChargeNetworkServiceController } from '@app/network-service/charge-network-service.controller'
import { ConfigModule } from '@nestjs/config'
import { ConsensusModule } from '@app/network-service/consensus/consensus.module'
import { GraphqlModule } from '@app/network-service/graphql/graphql.module'
import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { StakingModule } from '@app/network-service/staking/staking.module'
import { TokenModule } from '@app/common/token/token.module'
import { VoltageDexModule } from '@app/network-service/voltage-dex/voltage-dex.module'

@Module({
  imports: [
    StakingModule,
    HttpModule,
    GraphqlModule,
    ConsensusModule,
    BalancesModule,
    ConfigModule,
    TokenModule,
    VoltageDexModule
  ],
  controllers: [ChargeNetworkServiceController]
})
export class ChargeNetworkServiceModule { }
