import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { ApiKeyModule } from './api-keys/api-keys.module';
import { AppController } from './app.controller';

@Module({
  imports: [AuthModule, UsersModule, ProjectsModule, ApiKeyModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule { }
