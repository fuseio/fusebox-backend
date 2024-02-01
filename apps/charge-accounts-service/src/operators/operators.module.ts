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
import { ConfigModule, ConfigService } from '@nestjs/config'
import { DatabaseModule } from '@app/common'
import { operatorsProviders } from '@app/accounts-service/operators/operators.providers'
import { HttpModule } from '@nestjs/axios'
import { DataLayerModule } from '@app/smart-wallets-service/data-layer/data-layer.module'

@Module({
  imports: [
    UsersModule,
    ProjectsModule,
    AuthModule,
    PaymasterModule,
    ApiKeyModule,
    DataLayerModule,
    ConfigModule.forFeature(configuration),
    DatabaseModule,
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        headers: {
          'Content-Type': 'application/json',
          'API-SECRET': `${configService.get('PAYMASTER_FUNDER_API_SECRET_KEY')}`
        }
      }),
      inject: [ConfigService]
    })
  ],
  controllers: [OperatorsController],
  providers: [OperatorJwtStrategy, OperatorsService, ...operatorsProviders],
  exports: [OperatorsService]
})
export class OperatorsModule {}
