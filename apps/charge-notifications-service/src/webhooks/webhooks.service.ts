import { Inject, Injectable } from '@nestjs/common'
// import { InjectRedis } from '@liaoliaots/nestjs-redis'
// import Redis from 'ioredis'
import { CreateWebhookAddressesDto } from '@app/notifications-service/webhooks/dto/create-webhook-addresses.dto'
import { CreateWebhookDto } from '@app/notifications-service/webhooks/dto/create-webhook.dto'
import { UpdateWebhookDto } from '@app/notifications-service/webhooks/dto/update-webhook.dto'
import { WebhookAddress, WebhookAddressModel } from '@app/notifications-service/webhooks/interfaces/webhook-address.interface'
import { Webhook } from '@app/notifications-service/webhooks/interfaces/webhook.interface '
import { webhookAddressModelString, webhookModelString } from '@app/notifications-service/webhooks/webhooks.constants'
import { isEmpty } from 'lodash'
import { Model } from 'mongoose'

@Injectable()
export class WebhooksService {
  constructor (
    @Inject(webhookModelString)
    private webhookModel: Model<Webhook>,
    @Inject(webhookAddressModelString)
    private webhookAddressModel: Model<WebhookAddress, WebhookAddressModel>
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
    const result = await this.webhookModel.findByIdAndDelete(webhookId)

    if (!isEmpty(result)) {
      await this.webhookAddressModel.deleteMany({webhookId})
    }

    return result
  }

  async get (webhookId): Promise<Webhook> {
    return this.webhookModel.findById(webhookId)
  }

  async getAllByProjectId (projectId): Promise<Webhook[]> {
    return this.webhookModel.find({ projectId })
  }

  async createAddresses (createWebhookAddressesDto: CreateWebhookAddressesDto): Promise<any> {
    const docs = this.buildDocs(createWebhookAddressesDto)

    try {
      const result = await this.webhookAddressModel.insertMany(docs, { ordered: false })
      return result
    } catch (err) {
      // We are ignoring duplicate (webhookId, address) pairs that already exist in the DB
      // For such cases Mongoose throws a MongoBulkWrite error with code 11000
      // The error includes successfully "insertedDocs", so we only return this array
      // If we get an error with code different than 11000, we throw the error
      if (err.code === 11000) {
        return err?.insertedDocs
      } else {
        throw err
      }
    }
  }

  async getAddresses (webhookId: string) {
    return this.webhookAddressModel.find({ webhookId })
  }

  async deleteAddresses (createWebhookAddressesDto: CreateWebhookAddressesDto): Promise<any> {
    const query = {
      address: {
        $in: createWebhookAddressesDto.addresses
      },
      webhookId: {
        $eq: createWebhookAddressesDto.webhookId
      }
    }

    return this.webhookAddressModel.deleteMany(query)
  }

  async getAddressWatchers (address: string) {
    return this.webhookAddressModel.find({ address })
      .populate('webhookId', 'webhookUrl eventType')
  }

  private buildDocs (createWebhookAddressesDto: CreateWebhookAddressesDto) {
    return createWebhookAddressesDto.addresses.map(
      address => {
        const webhookAddress = {
          webhookId: createWebhookAddressesDto.webhookId,
          address
        } as WebhookAddress
        return webhookAddress
      })
  }
}
