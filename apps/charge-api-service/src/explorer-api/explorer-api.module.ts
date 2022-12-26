import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { ApiKeyModule } from '@app/api-service/api-keys/api-keys.module'
import { ConfigModule } from '@nestjs/config'
import configuration from '@app/api-service/explorer-api/config/configuration'
import { ExplorerApiController } from '@app/api-service/explorer-api/explorer-api.controller'

@Module({
  imports: [
    ApiKeyModule,
    HttpModule,
    ConfigModule.forFeature(configuration)
  ],
  controllers: [
    ExplorerApiController
  ]
})
export class ExplorerApiModule {}
