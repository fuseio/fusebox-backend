import { Inject, Injectable } from '@nestjs/common'
// import { InjectRedis } from '@liaoliaots/nestjs-redis'
// import Redis from 'ioredis'
import { webhookModelString } from '@app/notifications-service/webhooks/webhooks.constants'
import { Model } from 'mongoose'
import { Webhook } from '@app/notifications-service/webhooks/interfaces/webhook.interface '
import { CreateWebhookDto } from '@app/notifications-service/webhooks/dto/create-webhook.dto'
import { UpdateWebhookDto } from '@app/notifications-service/webhooks/dto/update-webhook.dto'

@Injectable()
export class WebhooksService {
  constructor (
    @Inject(webhookModelString)
    private webhookModel: Model<Webhook>
    // @InjectRedis() private readonly redis: Redis
  ) { }

  // async ping (): Promise<string> {
  //   return this.redis.ping()
  // }

  async create (createWebhookDto: CreateWebhookDto): Promise<Webhook> {
    return this.webhookModel.create(createWebhookDto)
  }

  async update (updateWebhookDto: UpdateWebhookDto): Promise<Webhook> {
    return this.webhookModel.findByIdAndUpdate(
      updateWebhookDto.webhookId,
      updateWebhookDto,
      { new: true }
    )
  }

  async delete (webhookId): Promise<Webhook> {
    return this.webhookModel.findByIdAndDelete(webhookId)
  }

  async get (webhookId): Promise<Webhook> {
    return this.webhookModel.findById(webhookId)
  }

  async getAllByProjectId (projectId): Promise<Webhook[]> {
    return this.webhookModel.find({ projectId })
  }
}
