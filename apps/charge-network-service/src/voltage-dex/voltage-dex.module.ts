import { ConfigModule } from '@nestjs/config'
import { Module } from '@nestjs/common'
import { VoltageDexController } from '@app/network-service/voltage-dex/voltage-dex.controller'
import VoltageDexGraphService from '@app/network-service/voltage-dex/graph.service'
import { VoltageDexService } from '@app/network-service/voltage-dex/voltage-dex.service'
import configuration from 'apps/charge-network-service/src/common/config/configuration'

@Module({
  imports: [
    // CacheModule.register({
    //   max: 100000,
    //   ttl: 600000 // in milliseconds
    // }),
    ConfigModule.forFeature(configuration)
    // HttpModule,
    // EthersModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   token: 'regular-node',
    //   useFactory: async (configService: ConfigService) => {
    //     const config = configService.get('rpcConfig')
    //     const { rpc } = config
    //     const { url, networkName, chainId } = rpc
    //     return {
    //       network: { name: networkName, chainId },
    //       custom: url,
    //       useDefaultProvider: false
    //     }
    //   }
    // })
  ],
  controllers: [VoltageDexController],
  providers: [VoltageDexService, VoltageDexGraphService],
  exports: [VoltageDexService]
})

export class VoltageDexModule {}
