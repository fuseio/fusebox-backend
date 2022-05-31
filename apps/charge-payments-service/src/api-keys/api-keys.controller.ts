import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ApiKeysService } from '@app/payments-service/api-keys/api-keys.service';

@Controller()
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) { }

  /**
   * Creates an API key secret for the given project
   * @param projectId
   * @returns the generated API key secret or error if secret already exists
   */
  @MessagePattern('create_secret')
  createSecret(projectId: string) {
    return this.apiKeysService.createSecretKey(projectId);
  }

  /**
   * Checks if an API key secret for the given project exists
   * @param projectId
   * @returns the generated API key secret or error if secret already exists
   */
  @MessagePattern('check_secret')
  checkIfSecretExists(projectId: string) {
    return this.apiKeysService.checkIfSecretExists(projectId);
  }

  /**
   * Revokes the old API key secret and generates a new one for the given project
   * @param projectId
   * @returns the new API key secret
   */
  @MessagePattern('update_secret')
  updateSecret(projectId: string) {
    return this.apiKeysService.updateSecretKey(projectId);
  }

  /**
   * Creates the public API key associated with the project
   * @param projectId
   * @returns the public API key associated with the given project
   */
  @MessagePattern('create_public')
  createPublic(projectId: string) {
    return this.apiKeysService.createPublicKey(projectId);
  }

  /**
   * Gets the public API key associated with the project
   * @param projectId
   * @returns the public API key associated with the given project
   */
  @MessagePattern('get_public')
  getPublic(projectId: string) {
    return this.apiKeysService.getPublicKey(projectId);
  }
}
