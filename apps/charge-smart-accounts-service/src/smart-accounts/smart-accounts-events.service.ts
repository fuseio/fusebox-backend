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

  get sharedAddresses () {
    return this.configService.get('sharedAddresses')
  }

  get walletVersion () {
    return this.configService.get('version')
  }

  get walletPaddedVersion () {
    return this.configService.get('paddedVersion')
  }

  async onCreateSmartAccountStarted (queueJob: any) {
    const { data: { walletAddress: smartAccountAddress, smartAccountUser, salt, walletModules } } = queueJob
    const { ownerAddress, projectId } = smartAccountUser
    this.smartAccountModel.create({
      projectId,
      salt,
      ownerAddress,
      smartAccountAddress,
      walletOwnerOriginalAddress: ownerAddress,
      walletFactoryOriginalAddress: this.sharedAddresses.WalletFactory,
      walletFactoryCurrentAddress: this.sharedAddresses.WalletFactory,
      walletImplementationOriginalAddress: this.sharedAddresses.WalletImplementation,
      walletImplementationCurrentAddress: this.sharedAddresses.WalletImplementation,
      walletModulesOriginal: walletModules,
      walletModules: this.sharedAddresses.walletModules,
      networks: ['fuse'],
      version: this.walletVersion,
      paddedVersion: this.walletPaddedVersion
    })
  }

  async onCreateSmartAccountSuccess (queueJob: any) {
    const { data: { walletAddress } } = queueJob
    const { ownerAddress, smartAccountAddress, walletModules, networks, version, paddedVersion } = await this.smartAccountModel.findOneAndUpdate({ smartAccountAddress: walletAddress }, { isContractDeployed: true }, { new: true })
    return { ownerAddress, smartAccountAddress, walletModules, networks, version, paddedVersion }
  }

  async onRelaySuccess (queueJob: any) {

  }
}
