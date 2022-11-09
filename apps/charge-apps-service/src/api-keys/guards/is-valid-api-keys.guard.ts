import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { ApiKeysService } from 'apps/charge-apps-service/src/api-keys/api-keys.service'
import * as bcrypt from 'bcryptjs'

@Injectable()
export class IsValidApiKeysGuard implements CanActivate {
  constructor (private apiKeysService: ApiKeysService) { }

  async canActivate (context: ExecutionContext): Promise<boolean> {
    const contextType = context.getType()

    if (contextType === 'rpc') {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const { query }: { query: { apiKey: string } } = request
    const appApiKey = await this.apiKeysService.findOne({ publicKey: query?.apiKey })
    const projectSecretHash = appApiKey?.secretHash
    const secretKey = request.header('API-SECRET')

    request.userId = appApiKey?.ownerId

    if (projectSecretHash && secretKey) {
      return await bcrypt.compare(secretKey, projectSecretHash)
    }
    return false
  }
}
