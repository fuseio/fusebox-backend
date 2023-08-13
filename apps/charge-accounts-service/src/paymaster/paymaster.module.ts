import { PaymasterController } from '@app/accounts-service/paymaster/paymaster.controller'
import { paymasterProviders } from '@app/accounts-service/paymaster/paymaster.providers'
import { PaymasterService } from '@app/accounts-service/paymaster/paymaster.service'
import { UsersModule } from '@app/accounts-service/users/users.module'
import { DatabaseModule } from '@app/common'
import { ProjectsModule } from '@app/accounts-service/projects/projects.module'
import { Module } from '@nestjs/common'
import configuration from '@app/accounts-service/paymaster/config/configuration'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [
    UsersModule,
    DatabaseModule,
    ProjectsModule,
    ConfigModule.forFeature(configuration)
  ],
  controllers: [PaymasterController],
  providers: [PaymasterService, ...paymasterProviders],
  exports: [PaymasterService]
})

export class PaymasterModule { }
