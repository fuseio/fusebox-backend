import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/common';
import { ApiKeysController } from 'apps/charge-api-service/src/api-keys/api-keys.controller';
import { ApiKeysService } from 'apps/charge-api-service/src/api-keys/api-keys.service';
import { apiKeysProviders } from 'apps/charge-api-service/src/api-keys/api-keys.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [ApiKeysController],
  providers: [ApiKeysService, ...apiKeysProviders],
  exports: [ApiKeysService],
})
export class ApiKeyModule {}
