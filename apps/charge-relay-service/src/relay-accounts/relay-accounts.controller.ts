import { Controller } from '@nestjs/common'
import { MessagePattern } from '@nestjs/microservices'
import { RelayAccountsService } from '@app/relay-service/relay-accounts/relay-accounts.service'

@Controller()
export class RelayAccountsController {
  constructor (private readonly relayAccountsService: RelayAccountsService) { }

  /**
   * Creates an Relay account for the given project
   * @param projectId
   * @returns the generated Relay account or error if account already exists
   */
  @MessagePattern('create_account')
  createAccount (projectId: string) {
    return this.relayAccountsService.createAccount(projectId)
  }
}
