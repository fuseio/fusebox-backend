import { forwardRef, Module } from '@nestjs/common';
import { DatabaseModule } from '../database.module';
import { ApiKeysController } from './api-keys.controller';
import { ApiKeysService } from './api-keys.service';
import { apiKeysProviders } from './api-keys.providers';
import { IsProjectOwnerGuard } from '../projects/guards/is-project-owner.guard';
import { UsersModule } from '../users/users.module';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [DatabaseModule, UsersModule, forwardRef(() => ProjectsModule)],
  controllers: [ApiKeysController],
  providers: [ApiKeysService, IsProjectOwnerGuard, ...apiKeysProviders],
  exports: [ApiKeysService],
})
export class ApiKeyModule {}
