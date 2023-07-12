import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { ApiKeyModule } from '@app/api-service/api-keys/api-keys.module'
import { ConfigModule } from '@nestjs/config'
import configuration from '@app/api-service/explorer-api/config/configuration'
import { PaymasterApiController } from '@app/api-service/paymaster-api/paymaster-api.controller'
import { ProjectsModule } from 'apps/charge-accounts-service/src/projects/projects.module'

@Module({
  imports: [
    ApiKeyModule,
    HttpModule,
    ConfigModule.forFeature(configuration),
    ProjectsModule
  ],
  controllers: [
    PaymasterApiController
  ]
})
export class PaymasterApiModule { }
