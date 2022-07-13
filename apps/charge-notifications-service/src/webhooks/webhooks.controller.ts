import { CreateWebhookAddressesDto } from '@app/notifications-service/webhooks/dto/create-webhook-addresses.dto'
import { CreateWebhookDto } from '@app/notifications-service/webhooks/dto/create-webhook.dto'
import { UpdateWebhookDto } from '@app/notifications-service/webhooks/dto/update-webhook.dto'
import { WebhooksService } from '@app/notifications-service/webhooks/webhooks.service'
import { Body, Controller } from '@nestjs/common'
import { MessagePattern } from '@nestjs/microservices'

@Controller('webhooks')
export class WebhooksController {
  constructor (private readonly webhooksService: WebhooksService) { }

  @MessagePattern('create_webhook')
  create (@Body() createWebhookDto: CreateWebhookDto) {
    return this.webhooksService.create(createWebhookDto)
  }

  @MessagePattern('update_webhook')
  update (@Body() updateWebhookDto: UpdateWebhookDto) {
    return this.webhooksService.update(updateWebhookDto)
  }

  @MessagePattern('delete_webhook')
  delete (@Body() webhookId: string) {
    return this.webhooksService.delete(webhookId)
  }

  @MessagePattern('get_webhook')
  get (@Body() webhookId: string) {
    return this.webhooksService.get(webhookId)
  }

  @MessagePattern('get_all_webhooks')
  getAll (@Body() projectId: string) {
    return this.webhooksService.getAllByProjectId(projectId)
  }

  @MessagePattern('create_addresses')
  createAddresses (@Body() createWebhookAddressesDto: CreateWebhookAddressesDto) {
    return this.webhooksService.createAddresses(createWebhookAddressesDto)
  }

  @MessagePattern('get_addresses')
  getAddresses (@Body() webhookId: string) {
    return this.webhooksService.getAddresses(webhookId)
  }

  @MessagePattern('delete_addresses')
  deleteAddresses (@Body() createWebhookAddressesDto: CreateWebhookAddressesDto) {
    return this.webhooksService.deleteAddresses(createWebhookAddressesDto)
  }
}
