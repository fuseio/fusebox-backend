import { Module } from '@nestjs/common'
import { ChargeNetworkServiceController } from '@app/network-service/charge-network-service.controller'
import { FarmModule } from '@app/network-service/farm/farm.module'
import { TransferModule } from '@app/network-service/transfer/transfer.module'

@Module({
  imports: [FarmModule, TransferModule],
  controllers: [ChargeNetworkServiceController]
})
export class ChargeNetworkServiceModule { }
