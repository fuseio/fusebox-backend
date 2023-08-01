import { DataLayerController } from '@app/smart-wallets-service/data-layer/data-layer.controller'
import { DataLayerService } from '@app/smart-wallets-service/data-layer/data-layer.service'
import { dataLayerProviders } from '@app/smart-wallets-service/data-layer/data-layer.providers'
import { Module } from '@nestjs/common'
import { DatabaseModule } from '@app/common'

@Module({
  imports: [DatabaseModule],
  controllers: [DataLayerController],
  providers: [DataLayerService, ...dataLayerProviders]
})
export class DataLayerModule { }
