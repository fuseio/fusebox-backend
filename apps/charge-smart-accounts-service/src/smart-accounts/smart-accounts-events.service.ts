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

  async onCreateSmartWallet (queueJob: any) {
    const { data: { walletAddress } } = queueJob
    const smartAccountWallet = await this.smartAccountModel.findOneAndUpdate({ walletAddress }, { isContractDeployed: true }, { new: true })
    return smartAccountWallet
  }

  async onRelay (queueJob: any) {

  }
}
