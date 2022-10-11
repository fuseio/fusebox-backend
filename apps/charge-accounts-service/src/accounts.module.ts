import { Module } from '@nestjs/common'
import { AuthModule } from '@app/accounts-service/auth/auth.module'
import { UsersModule } from '@app/accounts-service/users/users.module'
import { ProjectsModule } from '@app/accounts-service/projects/projects.module'
import { AccountsController } from '@app/accounts-service/accounts.controller'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ProjectsModule,
    ConfigModule.forRoot({ isGlobal: true })
  ],
  controllers: [AccountsController],
  providers: []
})
export class AccountsModule {}
