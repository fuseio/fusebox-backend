import { Inject, Injectable } from '@nestjs/common'
import { Model } from 'mongoose'
import { relayAccountModelString } from '@app/relay-service/relay-accounts/relay-accounts.constants'
import { RelayAccount } from '@app/relay-service/relay-accounts/interfaces/api-keys.interface '

@Injectable()
export class RelayAccountsService {
  constructor (
    @Inject(relayAccountModelString)
    private relayAccountModel: Model<RelayAccount>
  ) {}

  async createAccount (projectId: string) {
    console.log('Create account for ' + projectId)
  }
}
