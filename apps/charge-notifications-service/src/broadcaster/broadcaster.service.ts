import { eventTypes } from '@app/notifications-service/webhooks/schemas/webhook.schema'
import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import { Model } from 'mongoose'
import { webhookEventModelString } from '@app/notifications-service/common/constants/webhook-event.constants'
import { WebhookEvent } from '@app/notifications-service/common/interfaces/webhook-event.interface'
import { ConfigService } from '@nestjs/config'
import { Webhook } from '@app/notifications-service/webhooks/interfaces/webhook.interface'
import WebhookSendService from '@app/common/services/webhook-send.service'
import { InjectQueue } from '@nestjs/bull'
import { Job, Queue } from 'bull'
import { webhookEventsQueueString } from '@app/common/constants/queues.constants'

@Injectable()
export class BroadcasterService {
  private readonly logger = new Logger(BroadcasterService.name)

  constructor (
    @Inject(webhookEventModelString)
    private webhookEventModel: Model<WebhookEvent>,
    private readonly configService: ConfigService,
    private readonly webhookSendService: WebhookSendService,
    @InjectQueue(webhookEventsQueueString)
    private readonly webhookEventsQueue: Queue
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
    await this.processWebhookEventsFromQueue()
  }

  private async processWebhookEventsFromQueue () {
    // Process webhook events concurrently with a configurable concurrency limit
    const concurrency = this.configService.get('webhookProcessingConcurrency') || 10

    this.webhookEventsQueue.process(concurrency, async (job: Job) => {
      const webhookEvent = await this.webhookEventModel
        .findOne({ _id: job.id })
        .populate<{ webhook: Webhook }>('webhook')
        .exec()
      await this.processSingleWebhookEvent(webhookEvent)
    })
  }

  private async processSingleWebhookEvent (webhookEvent) {
    try {
      await this.attemptToSendWebhookEvent(webhookEvent)
    } catch (err) {
      await this.handleWebhookEventError(webhookEvent, err)
    } finally {
      await this.finalizeWebhookEvent(webhookEvent)
    }
  }

  private async attemptToSendWebhookEvent (webhookEvent) {
    webhookEvent.numberOfTries++
    const response = await this.webhookSendService.sendData(webhookEvent)
    webhookEvent.responses.push(this.getResponseDetailsWithDate(response.status, response.statusText))
    webhookEvent.success = true
  }

  private async handleWebhookEventError (webhookEvent, err: any) {
    const { errorStatus, errorResponse } = this.extractErrorDetails(err)
    this.logError(webhookEvent, errorStatus, errorResponse)
    webhookEvent.responses.push(this.getResponseDetailsWithDate(errorStatus, errorResponse))
    webhookEvent.retryAfter = new Date(this.getNewRetryAfterDate(webhookEvent))
  }

  private extractErrorDetails (err: any): { errorStatus: number; errorResponse: string } {
    let errorStatus: number, errorResponse: string
    if (err instanceof HttpException) {
      errorStatus = err.getStatus()
      errorResponse = err.getResponse().toString()
    } else {
      errorStatus = HttpStatus.INTERNAL_SERVER_ERROR
      errorResponse = JSON.stringify(err)
    }

    return { errorStatus, errorResponse }
  }

  private logError (webhookEvent, errorStatus: number, errorResponse: string) {
    if (isNaN(errorStatus)) {
      this.logger.warn(`Webhook ${webhookEvent._id} unable to send an webhook event to its URL:${webhookEvent.webhook.webhookUrl}`)
    } else {
      this.logger.error(`Webhook ${webhookEvent._id} returned error. Error message: ${errorResponse}, Error status: ${errorStatus}`)
    }
  }

  private async finalizeWebhookEvent (webhookEvent) {
    try {
      await webhookEvent.save()
    } catch (err) {
      this.logger.error(`Failed to save webhookEvent ${webhookEvent._id}: ${err}`)
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
