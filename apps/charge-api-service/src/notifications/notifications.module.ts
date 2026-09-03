import { notificationsService } from '@app/common/constants/microservices.constants'
import { Module } from '@nestjs/common'
import { ClientsModule } from '@nestjs/microservices'
import { tcpClient } from '@app/common/utils/tcp-transport'
import { NotificationsService } from '@app/api-service/notifications/notifications.service'
import { NotificationsController } from '@app/api-service/notifications/notifications.controller'
import { ApiKeyModule } from '@app/api-service/api-keys/api-keys.module'

@Module({
  imports: [
    ClientsModule.register([
      tcpClient(notificationsService, process.env.NOTIFICATIONS_HOST, process.env.NOTIFICATIONS_TCP_PORT)
    ]),
    ApiKeyModule
  ],
  providers: [NotificationsService],
  controllers: [NotificationsController],
  exports: [NotificationsService]
})
export class NotificationsModule {}
