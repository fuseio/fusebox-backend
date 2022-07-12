import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import { InjectRedis } from '@liaoliaots/nestjs-redis'
import Redis from 'ioredis'
import { webhookModelString } from '@app/notifications-service/webhooks/webhooks.constants'
import { Model } from 'mongoose'
import { Webhook } from '@app/notifications-service/webhooks/interfaces/webhook.interface '
import { CreateWebhookDto } from '@app/notifications-service/webhooks/dto/create-webhook.dto'
import { UpdateWebhookDto } from '@app/notifications-service/webhooks/dto/update-webhook.dto'
import { isEmpty } from 'lodash'
import { getDifference, getUnion } from '@app/common/utils/set-functions'

@Injectable()
export class WebhooksService {
  constructor (
    @Inject(webhookModelString)
    private webhookModel: Model<Webhook>,
    @InjectRedis() private readonly redis: Redis
  ) { }

  async ping (): Promise<string> {
    return this.redis.ping()
  }

  async create (createWebhookDto: CreateWebhookDto): Promise<Webhook> {
    createWebhookDto.watchAddresses = [...new Set(createWebhookDto.watchAddresses)]

    return this.webhookModel.create(createWebhookDto)
  }

  async update (updateWebhookDto: UpdateWebhookDto): Promise<Webhook> {
    const webhook = await this.webhookModel.findById(updateWebhookDto.webhookId)

    if (isEmpty(webhook)) {
      throw new HttpException(
        `Webhook with id ${webhook} was not found`,
        HttpStatus.NOT_FOUND
      )
    }

    updateWebhookDto.watchAddresses = getDifference(
      new Set(
        getUnion(
          new Set(webhook.watchAddresses),
          new Set(updateWebhookDto.addAddresses))),
      new Set(updateWebhookDto.removeAddresses))

    return this.webhookModel.findByIdAndUpdate(
      updateWebhookDto.webhookId,
      updateWebhookDto,
      { new: true }
    )
  }
}
