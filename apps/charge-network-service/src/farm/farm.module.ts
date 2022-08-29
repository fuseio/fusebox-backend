import { Module } from '@nestjs/common'
import { FarmController } from '@app/network-service/farm/farm.controller'
import { FarmService } from '@app/network-service/farm/farm.service'
import { ConfigModule } from '@nestjs/config'
import configuration from 'apps/charge-network-service/src/common/config/configuration'
import Web3ProviderService from '@app/common/services/web3-provider.service'

@Module({
  imports: [
    ConfigModule.forFeature(configuration)
  ],
  controllers: [FarmController],
  providers: [FarmService, Web3ProviderService],
  exports: [FarmService]
})
export class FarmModule {}
