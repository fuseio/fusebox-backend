import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { ApiKeysService } from 'apps/charge-api-service/src/api-keys/api-keys.service'
import * as bcrypt from 'bcryptjs'
@Injectable()
export class IsValidApiKeysGuard implements CanActivate {
  constructor(private apiKeysService: ApiKeysService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const { query }: { query: { apiKey: string } } = request
    const projectApiKey = await this.apiKeysService.findOne({ publicKey: query?.apiKey })
    const projectSecretHash = projectApiKey?.secretHash
    const secretKey = request.header('API-SECRET')

    if (projectSecretHash && secretKey) {
      request.projectId = projectApiKey.projectId
      return await bcrypt.compare(secretKey, projectSecretHash)
    }
    return false
  }
}
