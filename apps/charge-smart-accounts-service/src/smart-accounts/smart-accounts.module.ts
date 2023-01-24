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
    JwtModule.registerAsync({
      imports: [ConfigModule.forFeature(rpcConfig)],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const jwtSecret = configService.get('SMART_ACCOUNTS_JWT_SECRET')
        return {
          secret: jwtSecret
        }
      }
    }),
    ConfigModule.forFeature(rpcConfig),
  ],
  providers: [SmartAccountEventsGateway, SmartAccountsService],
  controllers: [SmartAccountsController]
})
export class SmartAccountsModule {}
