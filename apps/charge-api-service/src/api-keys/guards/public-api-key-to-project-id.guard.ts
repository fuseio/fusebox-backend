import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { ApiKeysService } from 'apps/charge-api-service/src/api-keys/api-keys.service'
import { isEmpty } from 'lodash'

@Injectable()
export class PublicApiKeyToProjectIdGuard implements CanActivate {
  constructor (private apiKeysService: ApiKeysService) { }

  async canActivate (context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const { query }: { query: { apiKey: string } } = request
    if (isEmpty(query?.apiKey)) {
      return false
    }
    const apiKey = await this.apiKeysService.findOne({ publicKey: query?.apiKey })
    if (isEmpty(apiKey)) {
      return false
    }
    request.projectId = apiKey.projectId
    return true
  }
}
