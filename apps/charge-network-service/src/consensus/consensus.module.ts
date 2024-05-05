import { CacheModule } from '@nestjs/cache-manager'
import { ScheduleModule } from '@nestjs/schedule'
import { Module } from '@nestjs/common'
import { ConsensusController } from '@app/network-service/consensus/consensus.controller'
import { ConsensusService } from '@app/network-service/consensus/consensus.service'
import { ConfigModule, ConfigService } from '@nestjs/config'
import configuration from 'apps/charge-network-service/src/common/config/configuration'
import { HttpModule } from '@nestjs/axios'
import { EthersModule } from 'nestjs-ethers'

@Module({
  imports: [
    ScheduleModule.forRoot(),
    CacheModule.register({
      ttl: 600000 // in milliseconds
    }),
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
    })
  ],
  controllers: [ConsensusController],
  providers: [ConsensusService],
  exports: [ConsensusService]
})

export class ConsensusModule {}
