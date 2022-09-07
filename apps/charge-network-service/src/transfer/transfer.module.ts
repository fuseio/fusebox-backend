import { Module } from '@nestjs/common'
import { TransferController } from '@app/network-service/transfer/transfer.controller'
import { TransferService } from '@app/network-service/transfer//transfer.service'
import Web3ProviderService from '@app/common/services/web3-provider.service'
import { ConfigModule } from '@nestjs/config'
import configuration from 'apps/charge-network-service/src/common/config/configuration'
import { HttpModule } from '@nestjs/axios'

@Module({
  imports: [
    ConfigModule.forFeature(configuration), HttpModule
  ],
  controllers: [TransferController],
  providers: [TransferService, Web3ProviderService],
  exports: [TransferService]
})
export class TransferModule { }
