import { NotificationsService } from '@app/api-service/notifications/notifications.service'
import { CreateWebhookDto } from '@app/notifications-service/webhooks/dto/create-webhook.dto'
import { UpdateWebhookDto } from '@app/notifications-service/webhooks/dto/update-webhook.dto'
import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common'
import { IsValidApiKeysGuard } from '@app/api-service/api-keys/guards/is-valid-api-keys.guard'
import { IsApiKeyProjectMatchGuard } from '@app/api-service/api-keys/guards/is-api-key-project-owner.guard'
import { CreateWebhookAddressesDto } from '@app/notifications-service/webhooks/dto/create-webhook-addresses.dto'
import { ApiOperation, ApiResponse, ApiParam, ApiBody, ApiHeader, ApiTags, ApiForbiddenResponse, ApiCreatedResponse } from '@nestjs/swagger'
import { CreateWebhookAddresses } from '@app/notifications-service/webhooks/entities/create-webhook-addresses.entity'
import { CreateWebhook } from '@app/notifications-service/webhooks/entities/create-webhook.entity'
import { UpdateWebhook } from '@app/notifications-service/webhooks/entities/update-webhook.entity'

@ApiTags('Notifications')
@UseGuards(IsApiKeyProjectMatchGuard)
@UseGuards(IsValidApiKeysGuard)
@Controller('v0/notifications')
export class NotificationsController {
  constructor (private readonly notificationsService: NotificationsService) { }

  @Post('webhook')
  @ApiOperation({ summary: 'Create a webhook associated with a project to receive notifications.' })
  @ApiParam({ name: 'apiKey', type: String, required: true })
  @ApiHeader({ name: 'API-SECRET', required: true, description: 'The secret key for the API key.' })
  @ApiBody({ type: CreateWebhook, required: true, description: 'The webhook to create.' })
  @ApiForbiddenResponse({ description: 'Forbidden.' })
  @ApiResponse({ status: 201, description: 'The created webhook.', type: Object })
  create (@Body() createWebhookDto: CreateWebhookDto) {
    return this.notificationsService.createWebhook(createWebhookDto)
  }

  @Put('webhook')
  @ApiOperation({ summary: 'Update a webhook associated with a project to receive notifications.' })
  @ApiParam({ name: 'apiKey', type: String, required: true })
  @ApiHeader({ name: 'API-SECRET', required: true, description: 'The secret key for the API key.' })
  @ApiBody({ type: UpdateWebhook, required: true, description: 'The webhook to update.' })
  @ApiForbiddenResponse({ description: 'Forbidden.' })
  @ApiCreatedResponse({ description: 'The updated webhook.', type: Object })
  update (@Body() updateWebhookDto: UpdateWebhookDto) {
    return this.notificationsService.updateWebhook(updateWebhookDto)
  }

  @Delete('webhook/:webhookId')
  @ApiOperation({ summary: 'Delete a webhook associated with a project to stop receiving notifications.' })
  @ApiParam({ name: 'apiKey', type: String, required: true })
  @ApiHeader({ name: 'API-SECRET', required: true, description: 'The secret key for the API key.' })
  @ApiParam({ name: 'webhookId', type: String, required: true })
  @ApiForbiddenResponse({ description: 'Forbidden.' })
  @ApiCreatedResponse({ description: 'The deleted webhook.', type: Object })
  delete (@Param('webhookId') webhookId: string) {
    return this.notificationsService.deleteWebhook(webhookId)
  }

  @Get('webhook/:webhookId')
  @ApiOperation({ summary: 'Retrieve details of a specific webhook by its ID.' })
  @ApiParam({ name: 'apiKey', type: String, required: true })
  @ApiParam({ name: 'webhookId', type: String, required: true })
  @ApiForbiddenResponse({ description: 'Forbidden.' })
  @ApiCreatedResponse({ description: 'The webhook.', type: Object })
  get (@Param('webhookId') webhookId: string) {
    return this.notificationsService.getWebhook(webhookId)
  }

  @Get('webhooks/:projectId')
  @ApiOperation({ summary: 'Get all webhooks associated with a project to receive notifications.' })
  @ApiParam({ name: 'apiKey', type: String, required: true })
  @ApiParam({ name: 'projectId', type: String, required: true })
  @ApiForbiddenResponse({ description: 'Forbidden.' })
  @ApiCreatedResponse({ description: 'The webhooks.', type: Array })
  getAll (@Param('projectId') projectId: string) {
    return this.notificationsService.getAllWebhooks(projectId)
  }

  @Post('webhook/add-addresses')
  @ApiOperation({ summary: 'Create addresses associated with a webhook to receive notifications.' })
  @ApiParam({ name: 'apiKey', type: String, required: true })
  @ApiHeader({ name: 'API-SECRET', required: true, description: 'The secret key for the API key.' })
  @ApiBody({ type: CreateWebhookAddresses, required: true, description: 'The addresses to create.' })
  @ApiForbiddenResponse({ description: 'Forbidden.' })
  @ApiResponse({ status: 201, description: 'The created addresses.', type: Object })
  createAddresses (@Body() createWebhookAddressesDto: CreateWebhookAddressesDto) {
    return this.notificationsService.createAddresses(createWebhookAddressesDto)
  }

  @Get('webhook/addresses/:webhookId')
  @ApiOperation({ summary: 'Get addresses associated with a webhook to receive notifications.' })
  @ApiParam({ name: 'apiKey', type: String, required: true })
  @ApiParam({ name: 'webhookId', type: String, required: true })
  @ApiForbiddenResponse({ description: 'Forbidden.' })
  @ApiCreatedResponse({ description: 'The addresses.', type: Array })
  getAddresses (@Param('webhookId') webhookId: string) {
    return this.notificationsService.getAddresses(webhookId)
  }

  @Post('webhook/delete-addresses')
  @ApiOperation({ summary: 'Delete addresses associated with a webhook to stop receiving notifications.' })
  @ApiParam({ name: 'apiKey', type: String, required: true })
  @ApiHeader({ name: 'API-SECRET', required: true, description: 'The secret key for the API key.' })
  @ApiBody({ type: CreateWebhookAddresses, required: true, description: 'The addresses to delete.' })
  @ApiForbiddenResponse({ description: 'Forbidden.' })
  @ApiCreatedResponse({ description: 'The deleted addresses.', type: Object })
  deleteAddresses (@Body() createWebhookAddressesDto: CreateWebhookAddressesDto) {
    return this.notificationsService.deleteAddresses(createWebhookAddressesDto)
  }
}
