import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { ConfigModule } from '@nestjs/config'
import { BalancesController } from 'apps/charge-network-service/src/balances/balances.controller'
import BalancesService from 'apps/charge-network-service/src/balances/balances.service'
import { UnmarshalService } from 'apps/charge-network-service/src/balances/services/unmarshal-balance.service'
import { ExplorerService } from 'apps/charge-network-service/src/balances/services/explorer-balance.service'
import configuration from 'apps/charge-network-service/src/common/config/configuration'
import GraphQLService from '@app/common/services/graphql.service'

@Module({
  imports: [
    ConfigModule.forFeature(configuration),
    HttpModule
  ],
  controllers: [BalancesController],
  providers: [
    GraphQLService,
    BalancesService,
    UnmarshalService,
    ExplorerService
  ]
})
export class BalancesModule {}
