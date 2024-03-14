import { Controller } from '@nestjs/common'
import { MessagePattern } from '@nestjs/microservices'
import { ApiKeysService } from 'apps/charge-api-service/src/api-keys/api-keys.service'
import { CreateSecretDto } from '@app/api-service/api-keys/dto/secret-key.dto'

@Controller()
export class ApiKeysController {
  constructor (private readonly apiKeysService: ApiKeysService) { }

  /**
   * Creates an API key secret for the given project
   * @param projectId
   * @returns the generated API key secret or error if secret already exists
   */
  @MessagePattern('create_secret')
  createSecret (createSecretDto: CreateSecretDto) {
    return this.apiKeysService.createSecretKey(createSecretDto.projectId, createSecretDto.createLegacyAccount)
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
   * Gets the project id for the given public api key
   * @param publicApiKey
   * @returns an object consisting unsensitive fields of the api_keys of the project
   */
  @MessagePattern('get_project_id_by_public_key')
  getProjectIdByPublicKey (apiKey: string) {
    return this.apiKeysService.getProjectIdByPublicKey(apiKey)
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
    return this.apiKeysService.getPublicKey(projectId)
  }

  /**
  * Creates the sandBox API key associated with the project
  * @param projectId
  * @returns the sandBox API key associated with the given project
  */
  @MessagePattern('create_sandbox_key')
  createSandbox (projectId: string) {
    return this.apiKeysService.createSandboxKey(projectId)
  }

  @MessagePattern('get_sandbox_key')
  getSandbox (projectId: string) {
    return this.apiKeysService.getSandboxKey(projectId)
  }
}
