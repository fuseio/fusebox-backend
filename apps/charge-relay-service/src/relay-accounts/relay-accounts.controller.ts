import { RelayAccountsService } from './relay-accounts.service';
import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class RelayAccountsController {
  constructor(private readonly relayAccountsService: RelayAccountsService) {}

  /**
   * Creates an Relay account for the given project
   * @param projectId
   * @returns the generated Relay account or error if account already exists
   */
  @MessagePattern('create_account')
  createAccount(projectId: string) {
    console.log('create_account' + projectId);
    return this.relayAccountsService.createAccount(projectId);
  }
}
