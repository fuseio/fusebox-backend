import { Module } from '@nestjs/common'
import { ChargeNetworkServiceController } from '@app/network-service/charge-network-service.controller'
import { FarmModule } from '@app/network-service/farm/farm.module'

@Module({
  imports: [FarmModule],
  controllers: [ChargeNetworkServiceController]
})
export class ChargeNetworkServiceModule {}
