import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { ApiKeysService } from 'apps/charge-api-service/src/api-keys/api-keys.service'
import { isEmpty } from 'lodash'

@Injectable()
export class IsPrdOrSbxKeyGuard implements CanActivate {
  constructor(private apiKeysService: ApiKeysService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const { query }: { query: { apiKey: string } } = request
    let apiKey
    if (query?.apiKey.includes('pk_test_')) {
      apiKey = await this.apiKeysService.findOne({ sandboxKey: query?.apiKey })
      if (!isEmpty(apiKey) && !isEmpty(query?.apiKey)) {
        request.projectId = apiKey.projectId
        request.environment = 'sandbox'
        return true
      }
    } else {
      apiKey = await this.apiKeysService.findOne({ publicKey: query?.apiKey })
      if (!isEmpty(apiKey) && !isEmpty(query?.apiKey)) {
        request.projectId = apiKey.projectId
        request.environment = 'production'
        return true
      }
    }
    return false
  }
}
