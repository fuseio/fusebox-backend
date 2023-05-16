import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { ApiKeysService } from 'apps/charge-api-service/src/api-keys/api-keys.service'
import { isEmpty } from 'lodash'

@Injectable()
export class IsValidPublicApiKeyGuard implements CanActivate {
  constructor (private apiKeysService: ApiKeysService) { }

  async canActivate (context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const { query }: { query: { apiKey: string } } = request
    const projectApiKey = await this.apiKeysService.findOne({ publicKey: query?.apiKey, isTest: false })

    if (!isEmpty(projectApiKey) && !isEmpty(query?.apiKey)) {
      request.projectId = projectApiKey.projectId
      return true
    }
    return false
  }
}
