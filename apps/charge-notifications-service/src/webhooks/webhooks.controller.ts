import { Controller, Get } from '@nestjs/common'
import { WebhooksService } from '@app/notifications-service/webhooks/webhooks.service'

@Controller('webhooks')
export class WebhooksController {
  constructor (private readonly webhooksService: WebhooksService) { }

    @Get('ping')
  ping () {
    return this.webhooksService.ping()
  }
}
