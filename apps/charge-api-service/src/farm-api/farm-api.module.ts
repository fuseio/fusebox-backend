import { Module } from '@nestjs/common'
import { networkServiceContext } from '@app/common/constants/microservices.constants'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { ApiKeyModule } from '@app/api-service/api-keys/api-keys.module'
import { FarmApiController } from '@app/api-service/farm-api/farm-api.controller'
import { FarmAPIService } from '@app/api-service/farm-api/farm-api.service'

@Module({
  imports: [
    ClientsModule.register([
      {
        name: networkServiceContext,
        transport: Transport.TCP,
        options: {
          host: process.env.NETWORK_HOST,
          port: parseInt(process.env.NETWORK_TCP_PORT)
        }
      }
    ]),
    ApiKeyModule
  ],
  providers: [FarmAPIService],
  controllers: [FarmApiController]
})
export class FarmAPIModule {}
