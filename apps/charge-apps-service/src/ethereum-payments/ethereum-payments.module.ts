import { DatabaseModule } from '@app/common'
import { Module } from '@nestjs/common'
import { EthereumPaymentsController } from '@app/apps-service/ethereum-payments/ethereum-payments.controller'
import { EthereumPaymentsService } from '@app/apps-service/ethereum-payments/ethereum-payments.service'
import { ethereumPaymentsProviders } from '@app/apps-service/ethereum-payments/ethereum-payments.providers'
import configuration from '@app/apps-service/common/config/configuration'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ApiKeysModule } from '@app/apps-service/api-keys/api-keys.module'
import { HttpModule } from '@nestjs/axios'
import { BackendWalletsEthereumService } from './backend-wallets-ethereum.service'

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        headers: {
          'Content-Type': 'application/json',
          'X-Alchemy-Token': `${configService.get('ALCHEMY_AUTH_KEY')}`
        }
      }),
      inject: [ConfigService]
    }), DatabaseModule, ConfigModule.forFeature(configuration), ApiKeysModule],
  controllers: [EthereumPaymentsController],
  providers: [EthereumPaymentsService, BackendWalletsEthereumService, ...ethereumPaymentsProviders]
})
export class EthereumPaymentsModule {}
