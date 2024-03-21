import { Inject, Injectable, Logger } from '@nestjs/common'
import { CreateWebhookAddressesDto } from '@app/notifications-service/webhooks/dto/create-webhook-addresses.dto'
import { CreateWebhookDto } from '@app/notifications-service/webhooks/dto/create-webhook.dto'
import { UpdateWebhookDto } from '@app/notifications-service/webhooks/dto/update-webhook.dto'
import { WebhookAddress } from '@app/notifications-service/webhooks/interfaces/webhook-address.interface'
import { Webhook } from '@app/notifications-service/webhooks/interfaces/webhook.interface'
import { webhookAddressModelString, webhookModelString } from '@app/notifications-service/webhooks/webhooks.constants'
import { isEmpty } from 'lodash'
import { Model } from 'mongoose'
import { TokenEventData } from '@app/notifications-service/common/interfaces/event-data.interface'
import { eventTypes } from '@app/notifications-service/webhooks/schemas/webhook.schema'
import { addressTypes } from '@app/notifications-service/common/schemas/webhook-event.schema'
import { webhookEventModelString } from '@app/notifications-service/common/constants/webhook-event.constants'
import { WebhookEvent } from '@app/notifications-service/common/interfaces/webhook-event.interface'

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name)

  constructor (
    @Inject(webhookModelString)
    private webhookModel: Model<Webhook>,
    @Inject(webhookAddressModelString)
    private webhookAddressModel: Model<WebhookAddress>,
    @Inject(webhookEventModelString)
    private webhookEventModel: Model<WebhookEvent>
  ) { }

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
      await this.webhookAddressModel.deleteMany({ webhookId })
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
      if (err.code === 11000) {
        // Handling duplicate key error
        const duplicateKeys = err.writeErrors?.map(error => ({
          index: error.index,
          errmsg: error.errmsg,
          op: error.op
        })) || []

        this.logger.warn(`Some entries were duplicates and not inserted for webhookId: ${createWebhookAddressesDto.webhookId}`)
        // Return a response indicating which entries were duplicates
        return {
          message: 'Some entries were duplicates and not inserted.',
          duplicateEntries: duplicateKeys
        }
      } else {
        // If the error code is not 11000, rethrow the error
        this.logger.error(err)
        throw err
      }
    }
  }

  async getAddresses (webhookId: string) {
    return this.webhookAddressModel.find({ webhookId })
  }

  async deleteAddresses (createWebhookAddressesDto: CreateWebhookAddressesDto): Promise<any> {
    const query = {
      lowercaseAddress: {
        $in: createWebhookAddressesDto.addresses.map(address => address.toLowerCase())
      },
      webhookId: {
        $eq: createWebhookAddressesDto.webhookId
      }
    }

    return this.webhookAddressModel.deleteMany(query)
  }

  async getAddressWatchers (address: string): Promise<any> {
    const addressWatchers = await this.webhookAddressModel
      .find({ lowercaseAddress: address.toLowerCase() })
      .populate('webhookId', 'webhookUrl eventType projectId')

    return addressWatchers.map(watcher => {
      const watcherJson = watcher.toJSON()

      if (!isEmpty(watcherJson.webhookId)) {
        return { ...watcherJson, ...watcherJson.webhookId }
      }

      return watcherJson
    })
  }

  async processWebhookTokenEvents (eventData: TokenEventData) {
    const toAddress = eventData?.to
    const fromAddress = eventData?.from
    const tokenAddress = eventData?.tokenAddress

    const tokenAddressWatchers = await this.getAddressWatchers(tokenAddress)

    await this.addRelevantWebhookTokensEventsToQueue(tokenAddressWatchers, eventData, null, addressTypes.TOKEN)

    const toAddressWatchers = await this.getAddressWatchers(toAddress)

    await this.addRelevantWebhookTokensEventsToQueue(toAddressWatchers, eventData, 'incoming', addressTypes.WALLET)

    const fromAddressWatchers = await this.getAddressWatchers(fromAddress)

    await this.addRelevantWebhookTokensEventsToQueue(fromAddressWatchers, eventData, 'outgoing', addressTypes.WALLET)
  }

  async addRelevantWebhookTokensEventsToQueue (addressWatchers: any, eventData: TokenEventData, direction: string | null, addressType) {
    for (const addressWatcher of addressWatchers) {
      const { webhookId, projectId, webhookUrl, eventType } = addressWatcher

      if (!isEmpty(webhookUrl) &&
        !isEmpty(eventType) &&
        this.isRelevantEvent(eventData.tokenType, eventType)) {
        try {
          this.logger.log(
            `Creating a new webhook event for the tx ${eventData.txHash}`
          )

          await this.webhookEventModel.create({
            webhook: webhookId,
            projectId,
            webhookUrl,
            eventData,
            direction,
            addressType
          })

          this.logger.log(
            `Created a new webhook event for the tx ${eventData.txHash}`
          )
        } catch (err) {
          this.logger.error(`Webhook event couldn't be added to the DB: ${err}`)
        }
      }
    }
  }

  isRelevantEvent (tokenType: string, eventType: string): boolean {
    // TODO: Choose better naming to make it clearer what each variable is
    if (eventType === eventTypes.ALL || tokenType === eventType) {
      return true
    }

    return false
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
