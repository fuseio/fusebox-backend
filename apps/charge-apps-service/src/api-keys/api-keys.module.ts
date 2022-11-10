import { apiKeysProviders } from '@app/apps-service/api-keys/api-keys.providers'
import { DatabaseModule } from '@app/common'
import { Module } from '@nestjs/common'
import { ApiKeysController } from '@app/apps-service/api-keys/api-keys.controller'
import { ApiKeysService } from '@app/apps-service/api-keys/api-keys.service'

@Module({
  imports: [DatabaseModule],
  controllers: [ApiKeysController],
  providers: [...apiKeysProviders, ApiKeysService],
  exports: [ApiKeysService]
})
export class ApiKeysModule {}
