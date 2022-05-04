import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';

@Module({
  imports: [UsersModule, AuthModule, ProjectsModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
