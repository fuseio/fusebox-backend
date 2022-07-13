import { NotificationsService } from '@app/api-service/notifications/notifications.service'
import { CreateWebhookDto } from '@app/notifications-service/webhooks/dto/create-webhook.dto'
import { UpdateWebhookDto } from '@app/notifications-service/webhooks/dto/update-webhook.dto'
import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common'
import { IsValidApiKeysGuard } from '@app/api-service/api-keys/guards/is-valid-api-keys.guard'
import { IsApiKeyProjectMatchGuard } from '@app/api-service/api-keys/guards/is-api-key-project-owner.guard'
import { CreateWebhookAddressesDto } from '@app/notifications-service/webhooks/dto/create-webhook-addresses.dto'

@UseGuards(IsApiKeyProjectMatchGuard)
@UseGuards(IsValidApiKeysGuard)
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

  @Delete('webhook')
  delete (@Body('webhookId') webhookId: string) {
    return this.notificationsService.deleteWebhook(webhookId)
  }

  @Get('webhook/:webhookId')
  get (@Param('webhookId') webhookId: string) {
    return this.notificationsService.getWebhook(webhookId)
  }

  @Get('webhooks/:projectId')
  getAll (@Param('projectId') projectId: string) {
    return this.notificationsService.getAllWebhooks(projectId)
  }

  @Post('webhook/addresses')
  createAddresses (@Body() createWebhookAddressesDto: CreateWebhookAddressesDto) {
    return this.notificationsService.createAddresses(createWebhookAddressesDto)
  }

  @Get('webhook/addresses/:webhookId')
  getAddresses (@Param('webhookId') webhookId: string) {
    return this.notificationsService.getAddresses(webhookId)
  }

  @Delete('webhook/addresses')
  deleteAddresses (@Body() createWebhookAddressesDto: CreateWebhookAddressesDto) {
    return this.notificationsService.deleteAddresses(createWebhookAddressesDto)
  }
}
