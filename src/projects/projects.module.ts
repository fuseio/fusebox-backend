import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { DatabaseModule } from 'src/database.module';
import { projectsProviders } from './projects.providers';
import { UsersModule } from 'src/users/users.module';
import { ApiKeyModule } from 'src/api-keys/api-keys.module';

@Module({
  imports: [UsersModule, DatabaseModule, ApiKeyModule],
  controllers: [ProjectsController],
  providers: [ProjectsService, ...projectsProviders],
  exports: [ProjectsService],
})
export class ProjectsModule {}
