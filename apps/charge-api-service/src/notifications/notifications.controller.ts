import { NotificationsService } from '@app/api-service/notifications/notifications.service'
import { CreateWebhookDto } from '@app/notifications-service/webhooks/dto/create-webhook.dto'
import { UpdateWebhookDto } from '@app/notifications-service/webhooks/dto/update-webhook.dto'
import { Body, Controller, Post, Put } from '@nestjs/common'

@Controller('v0/notifications')
export class NotificationsController {
  constructor (private readonly notificationsService: NotificationsService) { }

  @Post('webhook')
  create (@Body() createWebhookDto: CreateWebhookDto) {
    return this.notificationsService.createWebhook(createWebhookDto)
  }

  @Put('webhook')
  update (@Body() updateWebhookDto: UpdateWebhookDto) {
    return this.notificationsService.updateWebhook(updateWebhookDto)
  }
}
