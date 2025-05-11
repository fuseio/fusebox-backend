import { eventTypes } from '@app/notifications-service/webhooks/schemas/webhook.schema'
import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import { Model } from 'mongoose'
import { webhookEventModelString } from '@app/notifications-service/common/constants/webhook-event.constants'
import { WebhookEvent } from '@app/notifications-service/common/interfaces/webhook-event.interface'
import { ConfigService } from '@nestjs/config'
import { Webhook } from '@app/notifications-service/webhooks/interfaces/webhook.interface'
import WebhookSendService from '@app/common/services/webhook-send.service'

@Injectable()
export class BroadcasterService {
  private readonly logger = new Logger(BroadcasterService.name)
  private isProcessing = false
  private readonly MAX_RETRY_ATTEMPTS = 6
  private readonly PROCESSING_INTERVAL_MS = 2000

  constructor (
    @Inject(webhookEventModelString)
    private webhookEventModel: Model<WebhookEvent>,
    private readonly configService: ConfigService,
    private readonly webhookSendService: WebhookSendService
  ) { }

  get retryTimeIntervalsMS () {
    return this.configService.get('retryTimeIntervalsMS') as Record<number, number>
  }

  get maxTimeIntervalsMS (): number {
    return this.retryTimeIntervalsMS[Object.keys(this.retryTimeIntervalsMS).length]
  }

  getRetryTimeIntervalMS (numberOfTries: number) {
    return this.retryTimeIntervalsMS[numberOfTries] || this.maxTimeIntervalsMS
  }

  async onModuleInit (): Promise<void> {
    this.start()
  }

  async start () {
    if (this.isProcessing) {
      return
    }

    this.isProcessing = true

    try {
      while (true) {
        await this.processWebhookQueue()
        // Add delay between iterations to prevent excessive CPU usage
        await new Promise(resolve => setTimeout(resolve, this.PROCESSING_INTERVAL_MS))
      }
    } catch (error) {
      this.isProcessing = false
      this.logger.error(`Failed to process webhook queue: ${error}`)
      // Restart after delay if there was an error
      setTimeout(() => this.start(), this.PROCESSING_INTERVAL_MS)
    }
  }

  async processWebhookQueue () {
    const webhookEventsToSendNow = await this.webhookEventModel.find(
      {
        retryAfter: { $lte: new Date() },
        success: false,
        numberOfTries: { $lt: this.MAX_RETRY_ATTEMPTS }
      }
    ).populate<{ webhook: Webhook }>('webhook').sort({ retryAfter: -1 }).limit(100)

    this.logger.log(`Processing ${webhookEventsToSendNow.length} webhook events`)

    for (const webhookEvent of webhookEventsToSendNow) {
      try {
        const updatedEvent = await this.webhookEventModel.findByIdAndUpdate(
          webhookEvent._id,
          { $inc: { numberOfTries: 1 } },
          { new: true }
        )

        if (!updatedEvent) {
          this.logger.warn(`Webhook event ${webhookEvent._id} no longer exists`)
          continue
        }

        webhookEvent.numberOfTries = updatedEvent.numberOfTries

        this.logger.log(`Sending to ${webhookEvent.webhook.webhookUrl}. TxHash: ${webhookEvent.eventData.txHash}, Attempt: ${webhookEvent.numberOfTries}`)

        const response = await this.webhookSendService.sendData(webhookEvent)

        await this.webhookEventModel.findByIdAndUpdate(
          webhookEvent._id,
          {
            $set: { success: true },
            $push: { responses: this.getResponseDetailsWithDate(response.status, response.statusText) }
          }
        )
      } catch (err) {
        let errorStatus: number, errorResponse: string
        if (err instanceof HttpException) {
          errorStatus = err.getStatus()
          errorResponse = err.getResponse().toString()
          if (isNaN(errorStatus)) {
            this.logger.warn(`Webhook ${webhookEvent._id} unable to send an webhook event to its URL:${webhookEvent.webhook.webhookUrl}`)
          } else {
            this.logger.error(
              `Webhook ${webhookEvent._id} returned error. `,
              `Error message: ${errorResponse}`,
              `Error status: ${errorStatus}`
            )
          }
        } else {
          errorStatus = HttpStatus.INTERNAL_SERVER_ERROR
          errorResponse = JSON.stringify(err)
          this.logger.error(
            `Webhook ${webhookEvent._id} returned error. `,
            `Error message: ${errorResponse}`,
            `Error status: ${errorStatus}`
          )
        }

        const retryAfter = new Date(this.getNewRetryAfterDate(webhookEvent))

        try {
          await this.webhookEventModel.findByIdAndUpdate(
            webhookEvent._id,
            {
              $push: { responses: this.getResponseDetailsWithDate(errorStatus, errorResponse) },
              $set: { retryAfter }
            }
          )
        } catch (err) {
          this.logger.error(`Failed to save webhookEvent ${webhookEvent._id}: ${err}`)
        }
      }
    }
  }

  private getResponseDetailsWithDate (status: number, statusText: string): object {
    return {
      status,
      statusText,
      date: new Date()
    }
  }

  private getNewRetryAfterDate (webhookEvent: any) {
    const old = webhookEvent?.retryAfter || new Date()
    const addInterval = this.getRetryTimeIntervalMS(webhookEvent.numberOfTries)
    return new Date(old.getTime() + addInterval)
  }

  isRelevantEvent (tokenType: string, eventType: string): boolean {
    // TODO: Choose better naming to make it clearer what each variable is
    if (eventType === eventTypes.ALL || tokenType === eventType) {
      return true
    }

    return false
  }
}
