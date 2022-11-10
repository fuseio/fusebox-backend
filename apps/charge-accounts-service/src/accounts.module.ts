import { Module } from '@nestjs/common'
import { AuthModule } from '@app/accounts-service/auth/auth.module'
import { UsersModule } from '@app/accounts-service/users/users.module'
import { ProjectsModule } from '@app/accounts-service/projects/projects.module'
import { AccountsController } from '@app/accounts-service/accounts.controller'
import { ConfigModule } from '@nestjs/config'
import { AppStoreModule } from '@app/accounts-service/app-store/app-store.module'

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ProjectsModule,
    ConfigModule.forRoot({ isGlobal: true }),
    AppStoreModule
  ],
  controllers: [AccountsController],
  providers: []
})
export class AccountsModule {}
