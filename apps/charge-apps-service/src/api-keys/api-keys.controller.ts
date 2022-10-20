import { ApiKeysService } from '@app/apps-service/api-keys/api-keys.service'
import { Controller } from '@nestjs/common'
import { MessagePattern } from '@nestjs/microservices'
import { ApiKeysDto } from '@app/apps-service/api-keys/dto/api-keys.dto'

@Controller('api-keys')
export class ApiKeysController {
  constructor (private readonly apiKeysService: ApiKeysService) { }

  /**
   * Creates an API key secret for the given project
   * @param apiKeysDto
   * @returns the generated API key secret or error if secret already exists
   */
  @MessagePattern('create_secret')
  createSecret (apiKeysDto: ApiKeysDto) {
    return this.apiKeysService.createSecretKey(apiKeysDto)
  }

  /**
   * Gets the api_key's for the given projectId
   * @param apiKeysDto
   * @returns an object consisting unsensitive fields of the api_keys of the project
   */
  @MessagePattern('get_api_keys_info')
  checkIfSecretExists (apiKeysDto: ApiKeysDto) {
    return this.apiKeysService.getApiKeysInfo(apiKeysDto)
  }

  /**
   * Revokes the old API key secret and generates a new one for the given project
   * @param apiKeysDto
   * @returns the new API key secret
   */
  @MessagePattern('update_secret')
  updateSecret (apiKeysDto: ApiKeysDto) {
    return this.apiKeysService.updateSecretKey(apiKeysDto)
  }

  /**
   * Creates the public API key associated with the project
   * @param apiKeysDto
   * @returns the public API key associated with the given project
   */
  @MessagePattern('create_public')
  createPublic (apiKeysDto: ApiKeysDto) {
    return this.apiKeysService.createPublicKey(apiKeysDto)
  }

  /**
   * Gets the public API key associated with the project
   * @param apiKeysDto
   * @returns the public API key associated with the given project
   */
  @MessagePattern('get_public')
  getPublic (apiKeysDto: ApiKeysDto) {
    return this.apiKeysService.getPublicKey(apiKeysDto)
  }
}
