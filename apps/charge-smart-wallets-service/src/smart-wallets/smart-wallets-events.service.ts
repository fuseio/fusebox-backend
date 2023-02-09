import { Model } from 'mongoose'
import { ConfigService } from '@nestjs/config'
import { smartWalletString } from '@app/smart-wallets-service/smart-wallets/smart-wallets.constants'
import { SmartWallet } from '@app/smart-wallets-service/smart-wallets/interfaces/smart-wallets.interface'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { Centrifuge } from 'centrifuge'
import { websocketEvents } from '@app/smart-wallets-service/smart-wallets/constants/smart-wallets.constants'
import CentrifugoAPIService from '@app/common/services/centrifugo.service'

@Injectable()
export class SmartWalletsEventsService {
  private readonly logger = new Logger(SmartWalletsEventsService.name)

  constructor (
    private readonly configService: ConfigService,
    private readonly centrifuge: Centrifuge,
    private readonly centrifugoAPIService: CentrifugoAPIService,
    @Inject(smartWalletString)
    private smartWalletModel: Model<SmartWallet>
  ) { }

  async onModuleInit (): Promise<void> {
    this.subscribeToPublications()
  }

  async subscribeToPublications () {
    this.centrifuge.on('publication', (ctx) => {
      const { data, channel } = ctx
      if (channel === 'relayer') {
        const { eventName, eventData } = data
        switch (eventName) {
          case 'createWalletStarted':
            this.onCreateSmartWalletStarted(eventData)
            break
          case 'createWalletSuccess':
            this.onCreateSmartWalletSuccess(eventData)
            break
          case 'createWalletFailed':
            this.onCreateSmartWalletFailed(eventData)
            break
          case 'relayStarted':
            this.onRelayStarted(eventData)
            break
          case 'relaySuccess':
            this.onRelaySuccess(eventData)
            break
          case 'relayFailed':
            this.onRelayFailed(eventData)
            break
        }
      }
    })

    this.centrifuge.connect()
  }

  get sharedAddresses () {
    return this.configService.get('sharedAddresses')
  }

  get walletVersion () {
    return this.configService.get('version')
  }

  get walletPaddedVersion () {
    return this.configService.get('paddedVersion')
  }

  async onCreateSmartWalletStarted (eventData: any) {
    const {
      walletAddress,
      smartWalletUser,
      salt,
      walletModules
    } = eventData
    const {
      ownerAddress,
      projectId
    } = smartWalletUser

    this.smartWalletModel.create({
      projectId,
      salt,
      ownerAddress,
      smartWalletAddress: walletAddress,
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

    this.publishMessage(eventData, {
      eventName: websocketEvents.WALLET_CREATION_STARTED
    })
  }

  async onCreateSmartWalletSuccess (queueJob: any) {
    const { data: { walletAddress } } = queueJob
    const {
      ownerAddress,
      smartWalletAddress,
      walletModules,
      networks,
      version,
      paddedVersion
    } = await this.smartWalletModel.findOneAndUpdate(
      { smartWalletAddress: walletAddress },
      { isContractDeployed: true },
      { new: true }
    )
    return { ownerAddress, smartWalletAddress, walletModules, networks, version, paddedVersion }
  }

  async onCreateSmartWalletSuccessV2 (eventData: any) {
    const {
      ownerAddress,
      smartWalletAddress,
      walletModules,
      networks,
      version,
      paddedVersion
    } =
      await this.smartWalletModel.findOneAndUpdate(
        { smartWalletAddress: eventData.smartWalletAddress },
        { isContractDeployed: true },
        { new: true }
      )
    const data = {
      ownerAddress,
      smartWalletAddress,
      walletModules,
      networks,
      version,
      paddedVersion
    }
    this.publishMessage(eventData, {
      eventName: websocketEvents.WALLET_CREATION_SUCCEEDED,
      data
    })
  }

  async onCreateSmartWalletFailed (eventData: any) {
    this.publishMessage(eventData, {
      eventName: websocketEvents.WALLET_CREATION_FAILED
    })
  }

  async onRelaySuccess (eventData: any) {
    this.publishMessage(eventData, {
      eventName: websocketEvents.TRANSACTION_SUCCEEDED,
      eventData
    })
  }

  async onRelayFailed (eventData: any) {
    this.publishMessage(eventData, {
      eventName: websocketEvents.TRANSACTION_FAILED,
      eventData
    })
  }

  async onRelayStarted (eventData: any) {
    this.publishMessage(eventData, {
      eventName: websocketEvents.TRANSACTION_STARTED,
      eventData
    })
  }

  async publishMessage (eventData, messageData) {
    try {
      const { transactionId } = eventData
      this.centrifugoAPIService.publish(`transaction:#${transactionId}`, messageData)
    } catch (error) {
      this.logger.error({ error })
      this.logger.error(`An error occurred during publish message to channel: transaction:# eventData: ${JSON.stringify(eventData)}`)
    }
  }
}
