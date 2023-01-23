import rpcConfig from '@app/smart-accounts-service/common/config/rpc-config';
import { SmartAccountEventsGateway } from '@app/smart-accounts-service/smart-accounts/smart-account-events.gateway';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { EthersModule } from 'nestjs-ethers';
import { SmartAccountsController } from './smart-accounts.controller';
import { SmartAccountsService } from './smart-accounts.service';

@Module({
  imports: [
    EthersModule.forRootAsync({
      imports: [ConfigModule.forFeature(rpcConfig)],
      inject: [ConfigService],
      token: 'regular-node',
      useFactory: async (configService: ConfigService) => {
        const config = configService.get('rpcConfig')
        console.log('Rpc config ' + JSON.stringify(config))
        return {
          network: { name: config.rpc.networkName, chainId: config.rpc.chainId },
          custom: config.rpc.url,
          useDefaultProvider: false
        }
      }
    }),
    JwtModule.register({
      secret: 'secretKey',
      // signOptions: { expiresIn: '60s'}
    }),
    ConfigModule.forFeature(rpcConfig),
  ],
  providers: [SmartAccountEventsGateway, SmartAccountsService],
  controllers: [SmartAccountsController]
})
export class SmartAccountsModule {}
