import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/common';
import { ApiKeysController } from './api-keys.controller';
import { ApiKeysService } from './api-keys.service';
import { apiKeysProviders } from './api-keys.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [ApiKeysController],
  providers: [ApiKeysService, ...apiKeysProviders],
  exports: [ApiKeysService],
})
export class ApiKeyModule {}
