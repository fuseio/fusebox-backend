import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { ApiKeyModule } from './api-keys/api-keys.module';
import { AppController } from './app.controller';
import { StudioLegacyJwtModule } from './studio-legacy-jwt/studio-legacy-jwt.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ProjectsModule,
    ApiKeyModule,
    StudioLegacyJwtModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
