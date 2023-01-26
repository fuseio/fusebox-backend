import { HttpService } from '@nestjs/axios'
import { HttpException, Injectable, Logger } from '@nestjs/common'
import { catchError, lastValueFrom, map } from 'rxjs'
import { AxiosRequestConfig, AxiosResponse } from 'axios'

@Injectable()
export default class WebhookSendService {
  private readonly logger = new Logger(WebhookSendService.name)

  constructor (
    private readonly httpService: HttpService
  ) { }

  async sendData (webhookEvent: any, externalWebHookUrl?: string) {
    const webhookUrl = externalWebHookUrl || webhookEvent.webhook.webhookUrl

    const postBody = externalWebHookUrl
      ? webhookEvent
      : {
          ...webhookEvent.eventData,
          projectId: webhookEvent.projectId,
          direction: webhookEvent.direction,
          addressType: webhookEvent.addressType
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
          this.logger.log(`Sent webhook to ${webhookUrl} with data: ${JSON.stringify(postBody)}`)
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
}
