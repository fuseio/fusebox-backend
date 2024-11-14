import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { BalancesController } from 'apps/charge-network-service/src/balances/balances.controller'
import BalancesService from 'apps/charge-network-service/src/balances/balances.service'
import { UnmarshalService } from 'apps/charge-network-service/src/balances/services/unmarshal-balance.service'
import { ExplorerService } from 'apps/charge-network-service/src/balances/services/explorer-balance.service'
import configuration from 'apps/charge-network-service/src/common/config/configuration'
import GraphQLService from '@app/common/services/graphql.service'
import { TokenService } from '@app/smart-wallets-service/common/services/token.service'
import { EthersModule } from 'nestjs-ethers'
import { CacheModule } from '@nestjs/cache-manager'

@Module({
  imports: [
    ConfigModule.forFeature(configuration),
    HttpModule,
    EthersModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      token: 'regular-node',
      useFactory: async (configService: ConfigService) => {
        const config = configService.get('rpcConfig')
        const { rpc } = config
        const { url, networkName, chainId } = rpc
        return {
          network: { name: networkName, chainId },
          custom: url,
          useDefaultProvider: false
        }
      }
    }),
    CacheModule.register({
      ttl: 60000, // in milliseconds
      max: 1000
    })
  ],
  controllers: [BalancesController],
  providers: [
    TokenService,
    GraphQLService,
    BalancesService,
    UnmarshalService,
    ExplorerService
  ]
})
export class BalancesModule { }
