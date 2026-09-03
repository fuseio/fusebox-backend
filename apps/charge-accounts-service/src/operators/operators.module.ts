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
import { ClientsModule } from '@nestjs/microservices'
import { tcpClient } from '@app/common/utils/tcp-transport'
import { smartWalletsService, notificationsService } from '@app/common/constants/microservices.constants'
import { AnalyticsService } from '@app/common/services/analytics.service'
import { HttpModule } from '@nestjs/axios'
import { ScheduleModule } from '@nestjs/schedule'
import { TokenModule } from '@app/common/token/token.module'

@Module({
  imports: [
    UsersModule,
    ProjectsModule,
    AuthModule,
    HttpModule,
    PaymasterModule,
    ApiKeyModule,
    ClientsModule.register([
      tcpClient(smartWalletsService, process.env.SMART_WALLETS_HOST, process.env.SMART_WALLETS_TCP_PORT),
      tcpClient(notificationsService, process.env.NOTIFICATIONS_HOST, process.env.NOTIFICATIONS_TCP_PORT)
    ]),
    ConfigModule.forFeature(configuration),
    DatabaseModule,
    ScheduleModule.forRoot(),
    TokenModule
  ],
  controllers: [OperatorsController],
  providers: [
    OperatorJwtStrategy,
    AnalyticsService,
    OperatorsService,
    ...operatorsProviders
  ],
  exports: [OperatorsService]
})
export class OperatorsModule { }
