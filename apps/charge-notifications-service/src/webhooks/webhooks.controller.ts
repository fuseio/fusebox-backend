import { CreateWebhookDto } from '@app/notifications-service/webhooks/dto/create-webhook.dto'
import { UpdateWebhookDto } from '@app/notifications-service/webhooks/dto/update-webhook.dto'
import { WebhooksService } from '@app/notifications-service/webhooks/webhooks.service'
import { Body, Controller, Post, Put } from '@nestjs/common'
import { MessagePattern } from '@nestjs/microservices'

@Controller('webhooks')
export class WebhooksController {
  constructor (private readonly webhooksService: WebhooksService) { }

  @Post()
  @MessagePattern('create_webhook')
  create (@Body() createWebhookDto: CreateWebhookDto) {
    return this.webhooksService.create(createWebhookDto)
  }

  @Put('update')
  @MessagePattern('update_webhook')
  update (@Body() updateWebhookDto: UpdateWebhookDto) {
    return this.webhooksService.update(updateWebhookDto)
  }
}
