import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { DatabaseModule } from '../database.module';
import { projectsProviders } from './projects.providers';
import { UsersModule } from '../users/users.module';
import { ApiKeyModule } from '../api-keys/api-keys.module';
import { StudioLegacyJwtModule } from '../studio-legacy-jwt/studio-legacy-jwt.module';

@Module({
  imports: [UsersModule, DatabaseModule, ApiKeyModule, StudioLegacyJwtModule],
  controllers: [ProjectsController],
  providers: [ProjectsService, ...projectsProviders],
  exports: [ProjectsService],
})
export class ProjectsModule {}
