import { Inject, Injectable } from '@nestjs/common'
import { Model } from 'mongoose'
import Wallet from 'ethereumjs-wallet'
import * as cryptoAES from 'crypto-js/aes'
import { relayAccountModelString } from '@app/relay-service/relay-accounts/relay-accounts.constants'
import { RelayAccount } from '@app/relay-service/relay-accounts/interfaces/relay-accounts.interface'

@Injectable()
export class RelayAccountsService {
  constructor (
    @Inject(relayAccountModelString)
    private relayAccountModel: Model<RelayAccount>
  ) {}

  async createAccount (projectId: string) {
    const wallet = Wallet.generate()
    const encryptedPK = cryptoAES.encrypt(wallet.getPrivateKeyString(), process.env.RELAY_SECRET)
    const publicKey = wallet.getChecksumAddressString()
    this.relayAccountModel.create({
      projectId,
      encryptedPK,
      publicKey
    })

    return {
      publicKey
    }
  }
}
