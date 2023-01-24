import { ApiKeyModule } from '@app/api-service/api-keys/api-keys.module'
import { SmartAccountsAPIController } from '@app/api-service/smart-accounts/smart-accounts-api.controller'
import { SmartAccountsAPIService } from '@app/api-service/smart-accounts/smart-accounts-api.service'
import { smartAccountsService } from '@app/common/constants/microservices.constants'
import { Module } from '@nestjs/common'
import { ClientsModule, Transport } from '@nestjs/microservices'

@Module({
  imports: [
    ClientsModule.register([
      {
        name: smartAccountsService,
        transport: Transport.TCP,
        options: {
          host: process.env.SMART_ACCOUNTS_HOST,
          port: parseInt(process.env.SMART_ACCOUNTS_TCP_PORT)
        }
      }
    ]),
    ApiKeyModule
  ],
  controllers: [SmartAccountsAPIController],
  providers: [SmartAccountsAPIService]
})
export class SmartAccountsAPIModule {}
