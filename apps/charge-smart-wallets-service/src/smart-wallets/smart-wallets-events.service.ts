import { Model } from 'mongoose'
import { ConfigService } from '@nestjs/config'
import { smartWalletString } from '@app/smart-wallets-service/smart-wallets/smart-wallets.constants'
import { SmartWallet } from '@app/smart-wallets-service/smart-wallets/interfaces/smart-wallets.interface'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { Centrifuge } from 'centrifuge'
import { websocketEvents } from '@app/smart-wallets-service/smart-wallets/constants/smart-wallets.constants'
import CentrifugoAPIService from '@app/common/services/centrifugo.service'
import { sleep } from '@app/notifications-service/common/utils/helper-functions'

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
      walletModules,
      smartWalletAddress: walletAddress,
      walletOwnerOriginalAddress: ownerAddress,
      walletFactoryOriginalAddress: this.sharedAddresses.WalletFactory,
      walletFactoryCurrentAddress: this.sharedAddresses.WalletFactory,
      walletImplementationOriginalAddress: this.sharedAddresses.WalletImplementation,
      walletImplementationCurrentAddress: this.sharedAddresses.WalletImplementation,
      walletModulesOriginal: walletModules,
      networks: ['fuse'],
      version: this.walletVersion,
      paddedVersion: this.walletPaddedVersion
    })

    this.publishMessage(eventData, {
      eventName: websocketEvents.WALLET_CREATION_STARTED,
      eventData: {}
    })
  }

  async onCreateSmartWalletSuccess (eventData: any) {
    const {
      ownerAddress,
      smartWalletAddress,
      walletModules,
      networks,
      version,
      paddedVersion
    } =
      await this.smartWalletModel.findOneAndUpdate(
        { smartWalletAddress: eventData.walletAddress },
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
      eventData: data
    })
    this.unsubscribe(eventData)
  }

  async onCreateSmartWalletFailed (eventData: any) {
    this.publishMessage(eventData, {
      eventName: websocketEvents.WALLET_CREATION_FAILED
    })
    this.unsubscribe(eventData)
  }

  async onRelaySuccess (eventData: any) {
    this.publishMessage(eventData, {
      eventName: websocketEvents.TRANSACTION_SUCCEEDED,
      eventData
    })
    this.unsubscribe(eventData)
  }

  async onRelayFailed (eventData: any) {
    this.publishMessage(eventData, {
      eventName: websocketEvents.TRANSACTION_FAILED,
      eventData
    })
    this.unsubscribe(eventData)
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

  async unsubscribe (eventData) {
    try {
      await sleep(3000)
      const { walletAddress, transactionId } = eventData
      const { ownerAddress } = await this.smartWalletModel.findOne({ smartWalletAddress: walletAddress })
      this.centrifugoAPIService.unsubscribe(`transaction:#${transactionId}`, ownerAddress)
    } catch (error) {
      this.logger.error({ error })
      this.logger.error(`An error occurred during publish message to channel: transaction:# eventData: ${JSON.stringify(eventData)}`)
    }
  }
}
