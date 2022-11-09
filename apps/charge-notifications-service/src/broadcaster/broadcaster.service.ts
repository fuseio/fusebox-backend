import { eventTypes } from '@app/notifications-service/webhooks/schemas/webhook.schema'
import { HttpService } from '@nestjs/axios'
import { HttpException, Inject, Injectable, Logger } from '@nestjs/common'
import { AxiosRequestConfig, AxiosResponse } from 'axios'
import { Model } from 'mongoose'
import { catchError, lastValueFrom, map } from 'rxjs'
import { webhookEventModelString } from '@app/notifications-service/common/constants/webhook-event.constants'
import { WebhookEvent } from '@app/notifications-service/common/interfaces/webhook-event.interface'
import { ConfigService } from '@nestjs/config'
import { Webhook } from '@app/notifications-service/webhooks/interfaces/webhook.interface '

@Injectable()
export class BroadcasterService {
  private readonly logger = new Logger(BroadcasterService.name)

  constructor (
        private httpService: HttpService,
        @Inject(webhookEventModelString)
        private webhookEventModel: Model<WebhookEvent>,
        private readonly configService: ConfigService
  ) {}

  get retryTimeIntervalsMS () {
    return this.configService.get('retryTimeIntervalsMS') as Record<number, number>
  }

  async onModuleInit (): Promise<void> {
    this.start()
  }

  async start () {
    while (true) {
      const webhookEventsToSendNow = await this.webhookEventModel.find(
        {
          retryAfter: { $lte: new Date() },
          success: false,
          numberOfTries: { $lte: 6 }
        }
      ).populate<{ webhook: Webhook }>('webhook').sort({ retryAfter: -1 })

      for (const webhookEvent of webhookEventsToSendNow) {
        try {
          const response = await this.sendData(webhookEvent)
          webhookEvent.responses.push(this.getResponseDetailsWithDate(response.status, response.statusText))
          webhookEvent.numberOfTries++
          webhookEvent.success = true
        } catch (err) {
          if (err instanceof HttpException) {
            webhookEvent.responses.push(this.getResponseDetailsWithDate(err.getStatus(), err.getResponse().toString()))
            webhookEvent.numberOfTries++
            webhookEvent.retryAfter = new Date(this.getNewRetryAfterDate(webhookEvent))
          }
        } finally {
          try {
            await webhookEvent.save()
          } catch (err) {
            this.logger.error(`Failed to save webhookEvent: ${err}`)
          }
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
    const old = webhookEvent.retryAfter
    const addInterval = this.retryTimeIntervalsMS[webhookEvent.numberOfTries]
    return new Date(old.getTime() + addInterval)
  }

  private async sendData (webhookEvent: any) {
    const projectId = webhookEvent.projectId
    const direction = webhookEvent.direction
    const webhookUrl = webhookEvent.webhook.webhookUrl

    const postBody = {
      ...webhookEvent.eventData,
      projectId,
      direction
    }

    const headers: Record<string, any> = {
      'Content-Type': 'application/json'
    }

    const requestConfig: AxiosRequestConfig = {
      method: 'post',
      url: webhookUrl,
      data: postBody,
      headers
    }

    return lastValueFrom(this.httpService
      .request(
        requestConfig
      )
      .pipe(
        map((axiosResponse: AxiosResponse) => {
          this.logger.log(`Sent webhook to ${webhookUrl} with data: ${postBody}`)
          return axiosResponse
        })
      )
      .pipe(
        catchError(e => {
          const errorReason = e?.response?.data?.error ||
                        e?.response?.data?.errors?.message || ''

          throw new HttpException(
                        `${e?.response?.statusText}: ${JSON.stringify(errorReason)}`,
                        e?.response?.status
          )
        })
      )
    )
  }

  isRelevantEvent (tokenType: string, eventType: string): boolean {
    // TODO: Choose better naming to make it clearer what each variable is
    if (eventType === eventTypes.ALL || tokenType === eventType) {
      return true
    }

    return false
  }
}
