import { eventTypes } from '@app/notifications-service/webhooks/schemas/webhook.schema'
import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import { Model } from 'mongoose'
import { webhookEventModelString } from '@app/notifications-service/common/constants/webhook-event.constants'
import { WebhookEvent } from '@app/notifications-service/common/interfaces/webhook-event.interface'
import { ConfigService } from '@nestjs/config'
import { Webhook } from '@app/notifications-service/webhooks/interfaces/webhook.interface '
import WebhookSendService from '@app/common/services/webhook-send.service'

@Injectable()
export class BroadcasterService {
  private readonly logger = new Logger(BroadcasterService.name)

  constructor(
    @Inject(webhookEventModelString)
    private webhookEventModel: Model<WebhookEvent>,
    private readonly configService: ConfigService,
    private readonly webhookSendService: WebhookSendService

  ) { }

  get retryTimeIntervalsMS() {
    return this.configService.get('retryTimeIntervalsMS') as Record<number, number>
  }

  async onModuleInit(): Promise<void> {
    this.start()
  }

  async start() {
    while (true) {
      const webhookEventsToSendNow = await this.webhookEventModel.find(
        {
          retryAfter: { $lte: new Date() },
          success: false,
          numberOfTries: { $lt: 6 }
        }
      ).populate<{ webhook: Webhook }>('webhook').sort({ retryAfter: -1 })

      for (const webhookEvent of webhookEventsToSendNow) {
        try {
          webhookEvent.numberOfTries++
          const response = await this.webhookSendService.sendData(webhookEvent)
          webhookEvent.responses.push(this.getResponseDetailsWithDate(response.status, response.statusText))
          webhookEvent.success = true
        } catch (err) {
          let errorStatus = err.getStatus()
          let errorResponse = err.getResponse().toString()
          this.logger.error(`Webhook ${webhookEvent._id} returned error. Error message: ${err} \nStack: ${err?.stack}`)
          if (err instanceof HttpException) {
            errorStatus = err.getStatus()
            errorResponse = err.getResponse().toString()
          } else {
            errorStatus = HttpStatus.INTERNAL_SERVER_ERROR
            errorResponse = JSON.stringify(err)
          }
          webhookEvent.responses.push(this.getResponseDetailsWithDate(errorStatus, errorResponse))
          webhookEvent.retryAfter = new Date(this.getNewRetryAfterDate(webhookEvent))
        } finally {
          try {
            webhookEvent.numberOfTries++
            await webhookEvent.save()
          } catch (err) {
            this.logger.error(`Failed to save webhookEvent ${webhookEvent._id}: ${err}`)
          }
        }
      }
    }
  }

  private getResponseDetailsWithDate(status: number, statusText: string): object {
    return {
      status,
      statusText,
      date: new Date()
    }
  }

  private getNewRetryAfterDate(webhookEvent: any) {
    const old = webhookEvent?.retryAfter || new Date()
    const addInterval = this.retryTimeIntervalsMS[webhookEvent.numberOfTries]
    return new Date(old.getTime() + addInterval)
  }

  isRelevantEvent(tokenType: string, eventType: string): boolean {
    // TODO: Choose better naming to make it clearer what each variable is
    if (eventType === eventTypes.ALL || tokenType === eventType) {
      return true
    }

    return false
  }
}
