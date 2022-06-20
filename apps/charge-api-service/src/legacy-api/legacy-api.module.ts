import { Module } from '@nestjs/common'
import { LegacyWalletApiController } from '@app/api-service/legacy-api/legacy-wallet-api/legacy-wallet-api.controller'
import { LegacyAdminApiController } from '@app/api-service/legacy-api/legacy-admin-api/legacy-admin-api.controller'
import { ApiKeyModule } from '@app/api-service/api-keys/api-keys.module'
import { HttpModule } from '@nestjs/axios'
import { LegacyJobsApiController } from '@app/api-service/legacy-api/legacy-jobs-api/legacy-jobs-api.controller'
import { ConfigModule } from '@nestjs/config'
import configuration from '@app/api-service/legacy-api/config/configuration'
import { LegacyTradeApiController } from '@app/api-service/legacy-api/legacy-trade-api/legacy-trade-api.controller'

@Module({
  imports: [
    ApiKeyModule,
    HttpModule,
    ConfigModule.forFeature(configuration)
  ],
  controllers: [
    LegacyWalletApiController,
    LegacyAdminApiController,
    LegacyJobsApiController,
    LegacyTradeApiController
  ]
})
export class LegacyApiModule { }
