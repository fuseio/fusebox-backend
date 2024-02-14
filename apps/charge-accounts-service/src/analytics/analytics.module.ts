import { Module } from '@nestjs/common'
import { AnalyticsService } from '@app/accounts-service/analytics/analytics.service'
import { AnalyticsController } from '@app/accounts-service/analytics/analytics.controller'
import { UsersModule } from '@app/accounts-service/users/users.module'
import { ProjectsModule } from '@app/accounts-service/projects/projects.module'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { apiService } from '@app/common/constants/microservices.constants'
import { OperatorsModule } from '@app/accounts-service/operators/operators.module'

@Module({
  imports: [UsersModule, ProjectsModule,
    ClientsModule.register([
      {
        name: apiService,
        transport: Transport.TCP,
        options: {
          host: process.env.API_HOST,
          port: parseInt(process.env.API_TCP_PORT)
        }
      }
    ])
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService]
})
export class AnalyticsModule { }
