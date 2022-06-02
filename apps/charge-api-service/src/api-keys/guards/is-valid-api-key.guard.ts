import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ApiKeysService } from 'apps/charge-api-service/src/api-keys/api-keys.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class IsValidApiSecretKeyGuard implements CanActivate {
  constructor(private apiKeysService: ApiKeysService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { params }: { params: { projectId: string } } = request;
    const projectApiKey = await this.apiKeysService.findOne(params.projectId);
    const projectSecretHash = projectApiKey?.secretHash;
    const headerApiKey = request.header('X-API-Key');

    if (projectSecretHash && headerApiKey) {
      return await bcrypt.compare(headerApiKey, projectSecretHash);
    }
    return false;
  }
}
