import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { DatabaseModule } from 'src/database.module';
import { projectsProviders } from './projects.providers';
import { UsersModule } from 'src/users/users.module';
import { ApiKeyModule } from 'src/api-keys/api-keys.module';
import { StudioLegacyJwtModule } from 'src/studio-legacy-jwt/studio-legacy-jwt.module';

@Module({
  imports: [UsersModule, DatabaseModule, ApiKeyModule, StudioLegacyJwtModule],
  controllers: [ProjectsController],
  providers: [ProjectsService, ...projectsProviders],
  exports: [ProjectsService],
})
export class ProjectsModule {}
