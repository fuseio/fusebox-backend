import { Module } from '@nestjs/common'
import { AuthModule } from '@app/accounts-service/auth/auth.module'
import { UsersModule } from '@app/accounts-service/users/users.module'
import { ProjectsModule } from '@app/accounts-service/projects/projects.module'
import { PaymasterModule } from '@app/accounts-service/paymaster/paymaster.module'
import { AccountsController } from '@app/accounts-service/accounts.controller'
import { ConfigModule } from '@nestjs/config'
import { AppStoreModule } from '@app/accounts-service/app-store/app-store.module'
import { OperatorsModule } from '@app/accounts-service/operators/operators.module'
import { AnalyticsModule } from '@app/accounts-service/analytics/analytics.module'

@Module({
  imports: [
    AuthModule,
    UsersModule,
    AnalyticsModule,
    ProjectsModule,
    ConfigModule.forRoot({ isGlobal: true }),
    AppStoreModule,
    PaymasterModule,
    OperatorsModule

  ],
  controllers: [AccountsController],
  providers: []
})
export class AccountsModule { }
