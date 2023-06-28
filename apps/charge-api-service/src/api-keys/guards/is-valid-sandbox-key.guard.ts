import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { ApiKeysService } from 'apps/charge-api-service/src/api-keys/api-keys.service'
import { isEmpty } from 'lodash'

@Injectable()
export class IsValidSandboxApiKeyGuard implements CanActivate {
  constructor (private apiKeysService: ApiKeysService) { }

  async canActivate (context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const { query }: { query: { sandboxKey: string } } = request
    const sandboxApiKey = await this.apiKeysService.findOne({ sandboxKey: query?.sandboxKey })

    if (!isEmpty(sandboxApiKey) && !isEmpty(query?.sandboxKey)) {
      request.projectId = sandboxApiKey.projectId
      return true
    }
    return false
  }
}
