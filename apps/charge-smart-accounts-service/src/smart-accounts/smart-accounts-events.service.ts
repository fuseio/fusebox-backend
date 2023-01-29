import { Model } from 'mongoose'
import { ConfigService } from '@nestjs/config'
import { smartAccountString } from '@app/smart-accounts-service/smart-accounts/smart-accounts.constants'
import { SmartAccount } from '@app/smart-accounts-service/smart-accounts/interfaces/smart-account.interface'
import { Inject, Injectable, Logger } from '@nestjs/common'

@Injectable()
export class SmartAccountsEventsService {
  private readonly logger = new Logger(SmartAccountsEventsService.name)

  constructor (
    private readonly configService: ConfigService,
    @Inject(smartAccountString)
    private smartAccountModel: Model<SmartAccount>
  ) { }

  // TODO:
  async onCreateSmartAccount (queueJob: any) {
    const { data: { walletAddress } } = queueJob
    const smartAccountWallet = await this.smartAccountModel.findOneAndUpdate({ walletAddress }, { isContractDeployed: true }, { new: true }).projection({
      ownerAddress: 1,
      smartAccountAddress: 1,
      walletModules: 1,
      networks: 1,
      version: 1,
      walletPaddedVersion: 1,
      _id: 0
    })
    return smartAccountWallet
  }

  async onRelay (queueJob: any) {

  }
}
