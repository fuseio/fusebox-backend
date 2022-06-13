import { Module } from '@nestjs/common'
import { LegacyWalletApiController } from '@app/api-service/legacy-api/legacy-wallet-api/legacy-wallet-api.controller'
import { LegacyStudioApiController } from '@app/api-service/legacy-api/legacy-studio-api/legacy-studio-api.controller'
import { ApiKeyModule } from '@app/api-service/api-keys/api-keys.module'
import { HttpModule } from '@nestjs/axios'
import { LegacyJobsApiController } from '@app/api-service/legacy-api/legacy-jobs-api/legacy-jobs-api.controller'
import { ConfigModule } from '@nestjs/config'
import configuration from '@app/api-service/legacy-api/config/configuration'

@Module({
  imports: [
    ApiKeyModule,
    HttpModule,
    ConfigModule.forRoot({
      load: [configuration]
    })
  ],
  controllers: [LegacyWalletApiController, LegacyStudioApiController, LegacyJobsApiController]
})
export class LegacyApiModule { }
