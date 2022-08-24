import { Module } from '@nestjs/common'
import { defiServiceContext } from '@app/common/constants/microservices.constants'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { DeFiController } from './defi.controller'
import { DeFiService } from '@app/api-service/defi/defi.service'
import { ApiKeyModule } from '@app/api-service/api-keys/api-keys.module'

@Module({
  imports: [
    ClientsModule.register([
      {
        name: defiServiceContext,
        transport: Transport.TCP,
        options: {
          host: process.env.DEFI_HOST,
          port: parseInt(process.env.DEFI_TCP_PORT)
        }
      }
    ]),
    ApiKeyModule
  ],
  providers: [DeFiService],
  controllers: [DeFiController]
})
export class DeFiModule {}
