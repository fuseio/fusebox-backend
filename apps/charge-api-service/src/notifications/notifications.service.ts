import {
  notificationsService
  // relayService
} from '@app/common/constants/microservices.constants'
import { CreateWebhookAddressesDto } from '@app/notifications-service/webhooks/dto/create-webhook-addresses.dto'
import { CreateWebhookDto } from '@app/notifications-service/webhooks/dto/create-webhook.dto'
import { UpdateWebhookDto } from '@app/notifications-service/webhooks/dto/update-webhook.dto'
import { Webhook } from '@app/notifications-service/webhooks/interfaces/webhook.interface '
import { HttpException, Inject, Injectable } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { catchError, lastValueFrom, takeLast } from 'rxjs'

@Injectable()
export class NotificationsService {
  constructor (
        @Inject(notificationsService) private readonly notificationsClient: ClientProxy
  ) {}

  async createWebhook (createWebhookDto: CreateWebhookDto): Promise<Webhook> {
    return this.callMSFunction(this.notificationsClient, 'create_webhook', createWebhookDto)
  }

  async updateWebhook (updateWebhookDto: UpdateWebhookDto): Promise<Webhook> {
    return this.callMSFunction(this.notificationsClient, 'update_webhook', updateWebhookDto)
  }

  async deleteWebhook (webhookId: string): Promise<Webhook> {
    return this.callMSFunction(this.notificationsClient, 'delete_webhook', webhookId)
  }

  async getWebhook (webhookId: string): Promise<Webhook> {
    return this.callMSFunction(this.notificationsClient, 'get_webhook', webhookId)
  }

  async getAllWebhooks (projectId: string): Promise<Webhook[]> {
    return this.callMSFunction(this.notificationsClient, 'get_all_webhooks', projectId)
  }

  async createAddresses (createWebhookAddressesDto: CreateWebhookAddressesDto): Promise<any> {
    return this.callMSFunction(this.notificationsClient, 'create_addresses', createWebhookAddressesDto)
  }

  async getAddresses (webhookId: string): Promise<any> {
    return this.callMSFunction(this.notificationsClient, 'get_addresses', webhookId)
  }

  async deleteAddresses (createWebhookAddressesDto: CreateWebhookAddressesDto): Promise<any> {
    return this.callMSFunction(this.notificationsClient, 'delete_addresses', createWebhookAddressesDto)
  }

  private async callMSFunction (client: ClientProxy, pattern: string, data: any) {
    return lastValueFrom(
      client
        .send(pattern, data)
        .pipe(takeLast(1))
        .pipe(
          catchError((val) => {
            throw new HttpException(
              val.message,
              val.status
            )
          })
        )
    )
  }
}
