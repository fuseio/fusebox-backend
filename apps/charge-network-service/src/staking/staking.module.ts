import { Module } from '@nestjs/common'
import { StakingController } from '@app/network-service/staking/staking.controller'
import { StakingService } from '@app/network-service/staking/staking.service'
import { ConfigModule, ConfigService } from '@nestjs/config'
import configuration from 'apps/charge-network-service/src/common/config/configuration'
import { EthersModule } from 'nestjs-ethers'
import VoltBarService from '@app/network-service/staking/staking-providers/volt-bar.service'
import GraphService from '@app/network-service/staking/graph.service'
import { HttpModule } from '@nestjs/axios'
import FuseLiquidStakingService from '@app/network-service/staking/staking-providers/fuse-liquid-staking.service'
import { TokenModule } from '@app/common/token/token.module'
import SimpleStakingService from '@app/network-service/staking/staking-providers/simple-staking.service'

@Module({
  imports: [
    ConfigModule.forFeature(configuration),
    HttpModule,
    TokenModule,
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
    })
  ],
  controllers: [StakingController],
  providers: [
    StakingService,
    VoltBarService,
    FuseLiquidStakingService,
    SimpleStakingService,
    GraphService
  ],
  exports: [StakingService]
})
export class StakingModule { }
