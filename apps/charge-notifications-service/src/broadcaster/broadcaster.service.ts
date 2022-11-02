import { eventTypes } from '@app/notifications-service/webhooks/schemas/webhook.schema'
import { WebhooksService } from '@app/notifications-service/webhooks/webhooks.service'
import { HttpService } from '@nestjs/axios'
import { HttpException, Injectable, Logger } from '@nestjs/common'
import { AxiosRequestConfig, AxiosResponse } from 'axios'
import { isEmpty } from 'lodash'
import { catchError, lastValueFrom, map } from 'rxjs'

@Injectable()
export class BroadcasterService {
  private readonly logger = new Logger(BroadcasterService.name)

  constructor (
        private webhooksService: WebhooksService,
        private httpService: HttpService
  ) {}

  // TODO: Implement a queue to handle broadcasts asynchronously
  async broadCastEvent (eventData: any) {
    const toAddress = eventData?.to
    const fromAddress = eventData?.from

    const toAddressWatchers = await this.webhooksService.getAddressWatchers(toAddress)

    await this.broadcastToWatchers(toAddressWatchers, eventData, 'incoming')

    const fromAddressWatchers = await this.webhooksService.getAddressWatchers(fromAddress)

    await this.broadcastToWatchers(fromAddressWatchers, eventData, 'outgoing')
  }

  private async broadcastToWatchers (toAddressWatchers: any, eventData: any, direction: string) {
    for (const addressWatcher of toAddressWatchers) {
      const { webhookUrl, projectId, eventType } = addressWatcher

      if (!isEmpty(webhookUrl) &&
                !isEmpty(eventType) &&
                this.isRelevantEvent(eventData.tokenType, eventType)) {
        try {
          await this.sendData(eventData, projectId, direction, webhookUrl)
        } catch (err) {
          this.logger.log(err)
        }
      }
    }
  }

  private async sendData (eventData: any, projectId: any, direction: string, webhookUrl: any) {
    const postBody = {
      ...eventData,
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

    await lastValueFrom(this.httpService
      .request(
        requestConfig
      )
      .pipe(
        map((axiosResponse: AxiosResponse) => {
          this.logger.log(`Sent webhook to ${webhookUrl} with data: ${postBody}`)
          return axiosResponse.data
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
