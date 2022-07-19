import { DatabaseModule } from '@app/common';
import rpcConfig from '@app/notifications-service/common/config/rpc-config';
import { eventsScannerProviders } from '@app/notifications-service/events-scanner/events-scanner.providers';
import { EventsScannerService } from '@app/notifications-service/events-scanner/events-scanner.service';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EthersModule } from 'nestjs-ethers';

@Module({
    imports: [
        EthersModule.forRootAsync({
          imports: [ConfigModule.forFeature(rpcConfig)],
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => {
            const config = configService.get('rpcConfig')
            console.log('Rpc config ' + JSON.stringify(config))
              return {
                network: {name: config.rpc.networkName, chainId: config.rpc.chainId},
                custom: config.rpc.url || 'https://rpc.fuse.io',
                useDefaultProvider: false
            };
          }
        }),
        DatabaseModule,
        ConfigModule.forFeature(rpcConfig)
    ],
    providers: [EventsScannerService,...eventsScannerProviders]
})
export class EventsScannerModule {}
