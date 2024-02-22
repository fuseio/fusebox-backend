import { Module } from '@nestjs/common'
import { TrackerService } from '@app/accounts-service/analytics/analytics.service'
import { AnalyticsController } from '@app/accounts-service/analytics/analytics.controller'
import { UsersModule } from '@app/accounts-service/users/users.module'
import { ProjectsModule } from '@app/accounts-service/projects/projects.module'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { apiService } from '@app/common/constants/microservices.constants'
import { analyticsProviders } from '@app/accounts-service/analytics/analytics.providers'
import { DatabaseModule } from '@app/common'
import { AnalyticsService } from '@app/common/services/analytics.service'

@Module({
  imports: [
    UsersModule,
    ProjectsModule,
    ClientsModule.register([
      {
        name: apiService,
        transport: Transport.TCP,
        options: {
          host: process.env.API_HOST,
          port: parseInt(process.env.API_TCP_PORT)
        }
      }
    ]),
    DatabaseModule
  ],
  controllers: [AnalyticsController],
  providers: [TrackerService, AnalyticsService, ...analyticsProviders],
  exports: [TrackerService]
})
export class AnalyticsModule { }
