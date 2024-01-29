import { Module } from '@nestjs/common'
import { UsersModule } from '@app/accounts-service/users/users.module'
import { ProjectsModule } from '@app/accounts-service/projects/projects.module'
import { OperatorsController } from '@app/accounts-service/operators/operators.controller'
import { OperatorJwtStrategy } from '@app/accounts-service/operators/operator-jwt.strategy'
import { OperatorsService } from '@app/accounts-service/operators/operators.service'
import { AuthModule } from '@app/accounts-service/auth/auth.module'
import { PaymasterModule } from '@app/accounts-service/paymaster/paymaster.module'
import { ApiKeyModule } from '@app/api-service/api-keys/api-keys.module'
import configuration from '@app/accounts-service/paymaster/config/configuration'
import { ConfigModule } from '@nestjs/config'
import { SmartWalletsModule } from '@app/smart-wallets-service/smart-wallets/smart-wallets.module'

@Module({
  imports: [
    UsersModule,
    ProjectsModule,
    AuthModule,
    PaymasterModule,
    ApiKeyModule,
    ConfigModule.forFeature(configuration),
    SmartWalletsModule
  ],
  controllers: [OperatorsController],
  providers: [OperatorJwtStrategy, OperatorsService],
  exports: [OperatorsService]
})
export class OperatorsModule {}
