import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { DatabaseModule } from 'src/database.module';
import { projectsProviders } from './projects.providers';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [UsersModule, DatabaseModule],
  controllers: [ProjectsController],
  providers: [
    ProjectsService,
    ...projectsProviders]
})
export class ProjectsModule { }
