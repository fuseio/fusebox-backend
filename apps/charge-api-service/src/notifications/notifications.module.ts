import { notificationsService } from '@app/common/constants/microservices.constants'
import { Module } from '@nestjs/common'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { NotificationsService } from '@app/api-service/notifications/notifications.service'
import { NotificationsController } from '@app/api-service/notifications/notifications.controller'

@Module({
  imports: [
    ClientsModule.register([
      {
        name: notificationsService,
        transport: Transport.TCP,
        options: {
          host: process.env.NOTIFICATIONS_HOST,
          port: parseInt(process.env.NOTIFICATIONS_TCP_PORT)
        }
      }
    ])
  ],
  providers: [NotificationsService],
  controllers: [NotificationsController]
})
export class NotificationsModule {}
