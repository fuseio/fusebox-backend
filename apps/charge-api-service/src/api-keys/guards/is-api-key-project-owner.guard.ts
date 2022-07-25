import { NotificationsService } from '@app/api-service/notifications/notifications.service'
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { ApiKeysService } from '@app/api-service/api-keys/api-keys.service'
import { isEmpty } from 'lodash'

@Injectable()
export class IsApiKeyProjectMatchGuard implements CanActivate {
  constructor (
    private apiKeysService: ApiKeysService,
    private notificationService: NotificationsService
  ) { }

  async canActivate (context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const { query }: { query: { apiKey: string } } = request
    const { params }: { params: {projectId: string, webhookId: string } } = request
    const { body } : { body: { projectId: string, webhookId: string } } = request

    let projectId = params?.projectId || body?.projectId

    if (isEmpty(projectId)) {
      const webhookId = params?.webhookId || body?.webhookId
      const webhook = await this.notificationService.getWebhook(webhookId)

      if (isEmpty(webhook)) {
        return false
      }

      projectId = webhook?.projectId
    }

    const projectApiKey = await this.apiKeysService.findOne({
      publicKey: query?.apiKey,
      projectId,
      isTest: false
    })

    if (!isEmpty(projectApiKey)) {
      return true
    }
    return false
  }
}
