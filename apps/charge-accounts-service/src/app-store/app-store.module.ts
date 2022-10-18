import { Module } from '@nestjs/common';
import { AppStoreController } from '@app/accounts-service/app-store/app-store.controller';
import { AppStoreService } from './app-store.service';
import { ConfigModule } from '@nestjs/config';
import configuration from '@app/accounts-service/app-store/config/configuration'
import { appStoreProviders } from '@app/accounts-service/app-store/app-store.providers'
import { UsersModule } from '@app/accounts-service/users/users.module';
import { DatabaseModule } from '@app/common/database/database.module';

@Module({
  imports: [UsersModule, DatabaseModule, ConfigModule.forFeature(configuration)],
  controllers: [AppStoreController],
  providers: [AppStoreService, ...appStoreProviders]
})
export class AppStoreModule {}
