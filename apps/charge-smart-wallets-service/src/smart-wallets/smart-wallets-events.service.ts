import { Model } from 'mongoose'
import { ConfigService } from '@nestjs/config'
import { smartWalletString } from '@app/smart-wallets-service/smart-wallets/smart-wallets.constants'
import { SmartWallet } from '@app/smart-wallets-service/smart-wallets/interfaces/smart-wallets.interface'
import { Inject, Injectable, Logger } from '@nestjs/common'

@Injectable()
export class SmartWalletsEventsService {
  private readonly logger = new Logger(SmartWalletsEventsService.name)

  constructor (
    private readonly configService: ConfigService,
    @Inject(smartWalletString)
    private smartWalletModel: Model<SmartWallet>
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

  async onCreateSmartWalletStarted (queueJob: any) {
    const { data: { walletAddress: smartWalletAddress, smartWalletUser, salt, walletModules } } = queueJob
    const { ownerAddress, projectId } = smartWalletUser
    this.smartWalletModel.create({
      projectId,
      salt,
      ownerAddress,
      smartWalletAddress,
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

  async onCreateSmartWalletSuccess (queueJob: any) {
    const { data: { walletAddress } } = queueJob
    const { ownerAddress, smartWalletAddress, walletModules, networks, version, paddedVersion } =
    await this.smartWalletModel.findOneAndUpdate(
      { smartWalletAddress: walletAddress },
      { isContractDeployed: true },
      { new: true }
    )
    return { ownerAddress, smartWalletAddress, walletModules, networks, version, paddedVersion }
  }

  async onRelaySuccess (queueJob: any) {

  }
}
