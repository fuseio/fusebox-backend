import { Module } from '@nestjs/common'
import { LegacyWalletApiController } from './legacy-wallet-api/legacy-wallet-api.controller'
import { LegacyStudioApiController } from './legacy-studio-api/legacy-studio-api.controller'
import { ApiKeyModule } from '../api-keys/api-keys.module'
import { HttpModule } from '@nestjs/axios'
import { LegacyJobsApiController } from './legacy-jobs-api/legacy-jobs-api.controller'

@Module({
  imports: [ApiKeyModule, HttpModule],
  controllers: [LegacyWalletApiController, LegacyStudioApiController, LegacyJobsApiController]
})
export class LegacyApiModule { }
