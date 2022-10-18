import { Module } from '@nestjs/common'
import { AppStoreController } from '@app/accounts-service/app-store/app-store.controller'
import { AppStoreService } from '@app/accounts-service/app-store/app-store.service'
import { ConfigModule } from '@nestjs/config'
import configuration from '@app/accounts-service/app-store/config/configuration'
import { appStoreProviders } from '@app/accounts-service/app-store/app-store.providers'
import { UsersModule } from '@app/accounts-service/users/users.module'
import { DatabaseModule } from '@app/common/database/database.module'
import { ClientsModule, Transport } from '@nestjs/microservices'
import {
  appStoreService
} from '@app/common/constants/microservices.constants'

@Module({
  imports: [
    UsersModule,
    DatabaseModule,
    ConfigModule.forFeature(configuration),
    ClientsModule.register([
      {
        name: appStoreService,
        transport: Transport.TCP,
        options: {
          host: process.env.APPS_HOST,
          port: parseInt(process.env.APPS_TCP_PORT)
        }
      }
    ])
  ],
  controllers: [AppStoreController],
  providers: [AppStoreService, ...appStoreProviders]
})
export class AppStoreModule {}
