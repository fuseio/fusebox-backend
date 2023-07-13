import { PaymasterController } from '@app/accounts-service/paymaster/paymaster.controller'
import { paymasterProviders } from '@app/accounts-service/paymaster/paymaster.providers'
import { PaymasterService } from '@app/accounts-service/paymaster/paymaster.service'
import { UsersModule } from '@app/accounts-service/users/users.module'
import { DatabaseModule } from '@app/common'
import { ProjectsModule } from '@app/accounts-service/projects/projects.module'

import {
  apiService
  // relayService
} from '@app/common/constants/microservices.constants'
import { Module } from '@nestjs/common'
import { ClientsModule, Transport } from '@nestjs/microservices'

@Module({
  imports: [
    UsersModule,
    DatabaseModule,
    ProjectsModule,
    ClientsModule.register([
      {
        name: apiService,
        transport: Transport.TCP,
        options: {
          host: process.env.API_HOST,
          port: parseInt(process.env.API_TCP_PORT)
        }
      }
    ])
    // ClientsModule.register([
    //   {
    //     name: relayService,
    //     transport: Transport.TCP,
    //     options: {
    //       host: process.env.RELAY_HOST,
    //       port: parseInt(process.env.RELAY_TCP_PORT)
    //     }
    //   }
    // ])
  ],
  controllers: [PaymasterController],
  providers: [PaymasterService, ...paymasterProviders],
  exports: [PaymasterService]
})
export class PaymasterModule { }
