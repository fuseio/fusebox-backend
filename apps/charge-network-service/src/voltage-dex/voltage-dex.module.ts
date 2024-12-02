import { ConfigModule, ConfigService } from '@nestjs/config'

import { BlocksClient } from '@app/network-service/voltage-dex/services/blocks-client.service'
import { GraphQLClient } from 'graphql-request'
import { Module } from '@nestjs/common'
import { TokenAddressMapper } from '@app/network-service/voltage-dex/services/token-address-mapper.service'
import { TokenPriceService } from '@app/network-service/voltage-dex/services/token-price.service'
import { TokenStatsService } from '@app/network-service/voltage-dex/services/token-stats.service'
import { VoltageDexController } from '@app/network-service/voltage-dex/voltage-dex.controller'
import { VoltageDexService } from '@app/network-service/voltage-dex/voltage-dex.service'
import { VoltageV2Client } from '@app/network-service/voltage-dex/services/voltage-v2-client.service'
import { VoltageV3Client } from '@app/network-service/voltage-dex/services/voltage-v3-client.service'
import { VoltBarClient } from '@app/network-service/voltage-dex/services/volt-bar-client.service'
import configuration from 'apps/charge-network-service/src/common/config/configuration'

@Module({
  imports: [
    ConfigModule.forFeature(configuration)
  ],
  controllers: [VoltageDexController],
  providers: [
    {
      provide: 'VOLTAGE_V2_GRAPH_CLIENT',
      useFactory: (configService: ConfigService) => new GraphQLClient(configService.get<string>('voltageV2GraphUrl')),
      inject: [ConfigService]
    },
    {
      provide: 'VOLTAGE_V3_GRAPH_CLIENT',
      useFactory: (configService: ConfigService) => new GraphQLClient(configService.get<string>('voltageV3GraphUrl')),
      inject: [ConfigService]
    },
    {
      provide: 'BLOCKS_GRAPH_CLIENT',
      useFactory: (configService: ConfigService) => new GraphQLClient(configService.get<string>('blockGraphUrl')),
      inject: [ConfigService]
    },
    {
      provide: 'VOLT_BAR_GRAPH_CLIENT',
      useFactory: (configService: ConfigService) => new GraphQLClient(configService.get<string>('voltBarGraphUrl')),
      inject: [ConfigService]
    },
    {
      provide: VoltageV2Client,
      useFactory: (client: GraphQLClient) => new VoltageV2Client(client),
      inject: ['VOLTAGE_V2_GRAPH_CLIENT']
    },
    {
      provide: VoltageV3Client,
      useFactory: (client: GraphQLClient) => new VoltageV3Client(client),
      inject: ['VOLTAGE_V3_GRAPH_CLIENT']
    },
    {
      provide: BlocksClient,
      useFactory: (client: GraphQLClient) => new BlocksClient(client),
      inject: ['BLOCKS_GRAPH_CLIENT']
    },
    {
      provide: VoltBarClient,
      useFactory: (client: GraphQLClient) => new VoltBarClient(client),
      inject: ['VOLT_BAR_GRAPH_CLIENT']
    },
    TokenPriceService,
    TokenStatsService,
    TokenAddressMapper,
    VoltageDexService
  ],
  exports: [VoltageDexService]
})

export class VoltageDexModule {}
