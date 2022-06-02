import { Controller } from '@nestjs/common'
import { MessagePattern } from '@nestjs/microservices'
import { ApiKeysService } from 'apps/charge-api-service/src/api-keys/api-keys.service'

@Controller()
export class ApiKeysController {
  constructor (private readonly apiKeysService: ApiKeysService) { }

  /**
   * Creates an API key secret for the given project
   * @param projectId
   * @returns the generated API key secret or error if secret already exists
   */
  @MessagePattern('create_secret')
  createSecret (projectId: string) {
    return this.apiKeysService.createSecretKey(projectId)
  }

  /**
   * Gets the api_key's for the given projectId
   * @param projectId
   * @returns an object consisting unsensitive fields of the api_keys of the project
   */
  @MessagePattern('get_api_keys_info')
  checkIfSecretExists (projectId: string) {
    return this.apiKeysService.getApiKeysInfo(projectId)
  }

  /**
   * Revokes the old API key secret and generates a new one for the given project
   * @param projectId
   * @returns the new API key secret
   */
  @MessagePattern('update_secret')
  updateSecret (projectId: string) {
    return this.apiKeysService.updateSecretKey(projectId)
  }

  /**
   * Creates the public API key associated with the project
   * @param projectId
   * @returns the public API key associated with the given project
   */
  @MessagePattern('create_public')
  createPublic (projectId: string) {
    return this.apiKeysService.createPublicKey(projectId)
  }

  /**
   * Gets the public API key associated with the project
   * @param projectId
   * @returns the public API key associated with the given project
   */
  @MessagePattern('get_public')
  getPublic (projectId: string) {
    console.log('get public on api side')
    return this.apiKeysService.getPublicKey(projectId)
  }
}
