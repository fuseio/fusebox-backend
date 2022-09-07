import { Module } from '@nestjs/common';
import { TransferApiController } from '@app/api-service/network/transfer-api/transfer-api.controller';
import { TransferApiService } from '@app/api-service/network/transfer-api/transfer-api.service';
import { ClientsModule, Transport } from '@nestjs/microservices'
import { networkServiceContext } from '@app/common/constants/microservices.constants'
import { ApiKeyModule } from '@app/api-service/api-keys/api-keys.module'

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
  providers: [TransferApiService],
  controllers: [TransferApiController]
})
export class TransferApiModule { }
