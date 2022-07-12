import { Body, Controller, Get, Post, Put } from '@nestjs/common'
import { WebhooksService } from '@app/notifications-service/webhooks/webhooks.service'
import { CreateWebhookDto } from '@app/notifications-service/webhooks/dto/create-webhook.dto'
import { UpdateWebhookDto } from '@app/notifications-service/webhooks/dto/update-webhook.dto'

@Controller('webhooks')
export class WebhooksController {
  constructor (private readonly webhooksService: WebhooksService) { }

  @Get('ping')
  ping () {
    return this.webhooksService.ping()
  }

  @Post('create')
  create (@Body() createWebhookDto: CreateWebhookDto) {
    return this.webhooksService.create(createWebhookDto)
  }

  @Put('update')
  update (@Body() updateWebhookDto: UpdateWebhookDto) {
    return this.webhooksService.update(updateWebhookDto)
  }
}
