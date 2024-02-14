import { Module } from '@nestjs/common'
import { UsersModule } from '@app/accounts-service/users/users.module'
import { ProjectsModule } from '@app/accounts-service/projects/projects.module'
import { OperatorsController } from '@app/accounts-service/operators/operators.controller'
import { OperatorJwtStrategy } from '@app/accounts-service/operators/operator-jwt.strategy'
import { OperatorsService } from '@app/accounts-service/operators/operators.service'
import { AuthModule } from '@app/accounts-service/auth/auth.module'
import { PaymasterModule } from '@app/accounts-service/paymaster/paymaster.module'
import { ApiKeyModule } from '@app/api-service/api-keys/api-keys.module'
import configuration from '@app/accounts-service/common/config/configuration'
import { ConfigModule } from '@nestjs/config'
import { DatabaseModule } from '@app/common'
import { operatorsProviders } from '@app/accounts-service/operators/operators.providers'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { smartWalletsService, notificationsService } from '@app/common/constants/microservices.constants'
import { AnalyticsModule } from '@app/accounts-service/analytics/analytics.module'

@Module({
  imports: [
    UsersModule,
    ProjectsModule,
    AuthModule,
    PaymasterModule,
    ApiKeyModule,
    AnalyticsModule,
    ClientsModule.register([
      {
        name: smartWalletsService,
        transport: Transport.TCP,
        options: {
          host: process.env.SMART_WALLETS_HOST,
          port: parseInt(process.env.SMART_WALLETS_TCP_PORT)
        }
      }, {
        name: notificationsService,
        transport: Transport.TCP,
        options: {
          host: process.env.NOTIFICATIONS_HOST,
          port: parseInt(process.env.NOTIFICATIONS_TCP_PORT)
        }
      }
    ]),
    ConfigModule.forFeature(configuration),
    DatabaseModule
  ],
  controllers: [OperatorsController],
  providers: [OperatorJwtStrategy, OperatorsService, ...operatorsProviders],
  exports: [OperatorsService]
})
export class OperatorsModule { }
