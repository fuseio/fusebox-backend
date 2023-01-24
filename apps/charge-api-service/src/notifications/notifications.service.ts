import {
  notificationsService
  // relayService
} from '@app/common/constants/microservices.constants'
import { CreateWebhookAddressesDto } from '@app/notifications-service/webhooks/dto/create-webhook-addresses.dto'
import { CreateWebhookDto } from '@app/notifications-service/webhooks/dto/create-webhook.dto'
import { UpdateWebhookDto } from '@app/notifications-service/webhooks/dto/update-webhook.dto'
import { Webhook } from '@app/notifications-service/webhooks/interfaces/webhook.interface'
import { Inject, Injectable } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { callMSFunction } from '@app/common/utils/client-proxy'

@Injectable()
export class NotificationsService {
  constructor (
        @Inject(notificationsService) private readonly notificationsClient: ClientProxy
  ) {}

  async createWebhook (createWebhookDto: CreateWebhookDto): Promise<Webhook> {
    return callMSFunction(this.notificationsClient, 'create_webhook', createWebhookDto)
  }

  async updateWebhook (updateWebhookDto: UpdateWebhookDto): Promise<Webhook> {
    return callMSFunction(this.notificationsClient, 'update_webhook', updateWebhookDto)
  }

  async deleteWebhook (webhookId: string): Promise<Webhook> {
    return callMSFunction(this.notificationsClient, 'delete_webhook', webhookId)
  }

  async getWebhook (webhookId: string): Promise<Webhook> {
    return callMSFunction(this.notificationsClient, 'get_webhook', webhookId)
  }

  async getAllWebhooks (projectId: string): Promise<Webhook[]> {
    return callMSFunction(this.notificationsClient, 'get_all_webhooks', projectId)
  }

  async createAddresses (createWebhookAddressesDto: CreateWebhookAddressesDto): Promise<any> {
    return callMSFunction(this.notificationsClient, 'create_addresses', createWebhookAddressesDto)
  }

  async getAddresses (webhookId: string): Promise<any> {
    return callMSFunction(this.notificationsClient, 'get_addresses', webhookId)
  }

  async deleteAddresses (createWebhookAddressesDto: CreateWebhookAddressesDto): Promise<any> {
    return callMSFunction(this.notificationsClient, 'delete_addresses', createWebhookAddressesDto)
  }
}
