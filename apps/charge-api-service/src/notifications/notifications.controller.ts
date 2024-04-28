import { NotificationsService } from '@app/api-service/notifications/notifications.service'
import { CreateWebhookDto } from '@app/notifications-service/webhooks/dto/create-webhook.dto'
import { UpdateWebhookDto } from '@app/notifications-service/webhooks/dto/update-webhook.dto'
import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common'
import { IsValidApiKeysGuard } from '@app/api-service/api-keys/guards/is-valid-api-keys.guard'
import { IsApiKeyProjectMatchGuard } from '@app/api-service/api-keys/guards/is-api-key-project-owner.guard'
import { CreateWebhookAddressesDto } from '@app/notifications-service/webhooks/dto/create-webhook-addresses.dto'
import { ApiOperation, ApiParam, ApiBody, ApiHeader, ApiTags, ApiForbiddenResponse, ApiCreatedResponse, getSchemaPath, ApiOkResponse } from '@nestjs/swagger'
import { CreateWebhookAddresses } from '@app/notifications-service/webhooks/entities/create-webhook-addresses.entity'
import { CreateWebhook } from '@app/notifications-service/webhooks/entities/create-webhook.entity'
import { UpdateWebhook } from '@app/notifications-service/webhooks/entities/update-webhook.entity'

@ApiTags('Webhooks')
@UseGuards(IsApiKeyProjectMatchGuard)
@UseGuards(IsValidApiKeysGuard)
@Controller('v0/notifications')
export class NotificationsController {
  constructor (private readonly notificationsService: NotificationsService) { }

  @Post('webhook')
  @ApiOperation({
    summary: 'Create a webhook',
    description: 'Create a webhook associated with a project to receive notifications.'
  })
  @ApiParam({ name: 'apiKey', type: String, required: true, description: 'Your API key to authenticate requests.' })
  @ApiHeader({ name: 'API-SECRET', required: true, description: 'The secret API key for authentication.' })
  @ApiBody({ type: CreateWebhook, required: true, description: 'The webhook to create.' })
  @ApiForbiddenResponse({ description: 'Access to the resource is forbidden.' })
  @ApiCreatedResponse({
    description: 'Webhook successfully created.',
    content: {
      'application/json': {
        schema: { $ref: getSchemaPath('WebhookCreateRequest') }
      }
    }
  })
  create (@Body() createWebhookDto: CreateWebhookDto) {
    return this.notificationsService.createWebhook(createWebhookDto)
  }

  @Put('webhook')
  @ApiOperation({
    summary: 'Update a webhook',
    description: 'Update a webhook\'s details such as its URL or event type.'
  })
  @ApiParam({ name: 'apiKey', type: String, required: true, description: 'Your API key to authenticate requests.' })
  @ApiHeader({ name: 'API-SECRET', required: true, description: 'The secret API key for authentication.' })
  @ApiBody({ type: UpdateWebhook, required: true, description: 'The webhook to update.' })
  @ApiForbiddenResponse({ description: 'Access to the resource is forbidden.' })
  @ApiOkResponse({
    description: 'Webhook successfully updated.',
    content: {
      'application/json': {
        schema: { $ref: getSchemaPath('WebhookUpdateRequest') }
      }
    }
  })
  update (@Body() updateWebhookDto: UpdateWebhookDto) {
    return this.notificationsService.updateWebhook(updateWebhookDto)
  }

  @Delete('webhook/:webhookId')
  @ApiOperation({
    summary: 'Delete a webhook',
    description: 'Delete a webhook associated with a project to stop receiving notifications.'
  })
  @ApiParam({ name: 'apiKey', type: String, required: true, description: 'Your API key to authenticate requests.' })
  @ApiHeader({ name: 'API-SECRET', required: true, description: 'The secret API key for authentication.' })
  @ApiParam({ name: 'webhookId', type: String, required: true, description: 'The unique identifier of the webhook.' })
  @ApiForbiddenResponse({ description: 'Access to the resource is forbidden.' })
  @ApiOkResponse({
    description: 'Webhook successfully deleted.',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Webhook successfully deleted.'
            }
          }
        }
      }
    }
  })
  delete (@Param('webhookId') webhookId: string) {
    return this.notificationsService.deleteWebhook(webhookId)
  }

  @Get('webhook/:webhookId')
  @ApiOperation({
    summary: 'Get a webhook by ID',
    description: 'Retrieve details of a specific webhook by its ID.'
  })
  @ApiParam({ name: 'apiKey', type: String, required: true, description: 'Your API key to authenticate requests.' })
  @ApiHeader({ name: 'API-SECRET', required: true, description: 'The secret API key for authentication.' })
  @ApiParam({ name: 'webhookId', type: String, required: true, description: 'The unique identifier of the webhook.' })
  @ApiForbiddenResponse({ description: 'Access to the resource is forbidden.' })
  @ApiOkResponse({
    description: 'Details of the specified webhook.',
    content: {
      'application/json': {
        schema: { $ref: getSchemaPath('WebhookCreateRequest') }
      }
    }
  })
  get (@Param('webhookId') webhookId: string) {
    return this.notificationsService.getWebhook(webhookId)
  }

  @Get('webhooks/:projectId')
  @ApiOperation({
    summary: 'Get webhooks for a project',
    description: 'Retrieve all webhooks associated with a given project ID.'
  })
  @ApiParam({ name: 'apiKey', type: String, required: true, description: 'Your API key to authenticate requests.' })
  @ApiHeader({ name: 'API-SECRET', required: true, description: 'The secret API key for authentication.' })
  @ApiParam({ name: 'projectId', type: String, required: true, description: 'The unique identifier of the project.' })
  @ApiForbiddenResponse({ description: 'Access to the resource is forbidden.' })
  @ApiOkResponse({
    description: 'List of all webhooks for the specified project.',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: { $ref: getSchemaPath('WebhookCreateRequest') }
        }
      }
    }
  })
  getAll (@Param('projectId') projectId: string) {
    return this.notificationsService.getAllWebhooks(projectId)
  }

  @Post('webhook/add-addresses')
  @ApiOperation({
    summary: 'Add addresses to a webhook',
    description: 'Associate new addresses with an existing webhook to listen for their events.'
  })
  @ApiParam({ name: 'apiKey', type: String, required: true, description: 'Your API key to authenticate requests.' })
  @ApiHeader({ name: 'API-SECRET', required: true, description: 'The secret API key for authentication.' })
  @ApiBody({ type: CreateWebhookAddresses, required: true, description: 'The addresses to create.' })
  @ApiForbiddenResponse({ description: 'Access to the resource is forbidden.' })
  @ApiOkResponse({
    description: 'Addresses successfully added to the webhook.',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: { $ref: getSchemaPath('WebhookAddAddressesRequest') }
        }
      }
    }
  })
  createAddresses (@Body() createWebhookAddressesDto: CreateWebhookAddressesDto) {
    return this.notificationsService.createAddresses(createWebhookAddressesDto)
  }

  @Get('webhook/addresses/:webhookId')
  @ApiOperation({
    summary: 'Get addresses for a webhook',
    description: 'Retrieve all addresses associated with a specific webhook.'
  })
  @ApiParam({ name: 'apiKey', type: String, required: true, description: 'Your API key to authenticate requests.' })
  @ApiHeader({ name: 'API-SECRET', required: true, description: 'The secret API key for authentication.' })
  @ApiParam({ name: 'webhookId', type: String, required: true, description: 'The unique identifier of the webhook.' })
  @ApiForbiddenResponse({ description: 'Access to the resource is forbidden.' })
  @ApiOkResponse({
    description: 'List of all addresses for the specified webhook.',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: { $ref: getSchemaPath('WebhookAddAddressesRequest') }
        }
      }
    }
  })
  getAddresses (@Param('webhookId') webhookId: string) {
    return this.notificationsService.getAddresses(webhookId)
  }

  @Post('webhook/delete-addresses')
  @ApiOperation({
    summary: 'Delete addresses from a webhook',
    description: 'Remove addresses from a webhook\'s listening scope.'
  })
  @ApiParam({ name: 'apiKey', type: String, required: true, description: 'Your API key to authenticate requests.' })
  @ApiHeader({ name: 'API-SECRET', required: true, description: 'The secret API key for authentication.' })
  @ApiBody({ type: CreateWebhookAddresses, required: true, description: 'The addresses to delete.' })
  @ApiForbiddenResponse({ description: 'Access to the resource is forbidden.' })
  @ApiOkResponse({
    description: 'Addresses successfully deleted from the webhook.',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Addresses successfully deleted from the webhook.'
            }
          }
        }
      }
    }
  })
  deleteAddresses (@Body() createWebhookAddressesDto: CreateWebhookAddressesDto) {
    return this.notificationsService.deleteAddresses(createWebhookAddressesDto)
  }
}
