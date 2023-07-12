import { Module } from '@nestjs/common'
import { DatabaseModule } from '@app/common'
import { ApiKeysController } from '@app/api-service/api-keys/api-keys.controller'
import { ApiKeysService } from '@app/api-service/api-keys/api-keys.service'
import { apiKeysProviders } from '@app/api-service/api-keys/api-keys.providers'
import { StudioLegacyJwtModule } from '@app/api-service/studio-legacy-jwt/studio-legacy-jwt.module'
import { ProjectsModule } from 'apps/charge-accounts-service/src/projects/projects.module'

@Module({
  imports: [DatabaseModule, StudioLegacyJwtModule, ProjectsModule],
  controllers: [ApiKeysController],
  providers: [ApiKeysService, ...apiKeysProviders],
  exports: [ApiKeysService]
})
export class ApiKeyModule { }
