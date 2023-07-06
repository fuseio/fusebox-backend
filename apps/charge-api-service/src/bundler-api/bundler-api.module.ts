import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { ApiKeyModule } from '@app/api-service/api-keys/api-keys.module'
import { ConfigModule } from '@nestjs/config'
import configuration from '@app/api-service/bundler-api/config/configuration'
import { BundlerApiController } from '@app/api-service/bundler-api/bundler-api.controller'

@Module({
  imports: [
    ApiKeyModule,
    HttpModule,
    ConfigModule.forFeature(configuration)
  ],
  controllers: [
    BundlerApiController
  ]
})
export class BundlerApiModule { }
