import { Model } from 'mongoose'
import { ConfigService } from '@nestjs/config'
import { smartWalletString } from '@app/smart-wallets-service/smart-wallets/smart-wallets.constants'
import { SmartWallet } from '@app/smart-wallets-service/smart-wallets/interfaces/smart-wallets.interface'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { Centrifuge } from 'centrifuge'
import { websocketEvents } from '@app/smart-wallets-service/smart-wallets/constants/smart-wallets.constants'
import { CentClient } from 'cent.js'
import { sleep } from '@app/notifications-service/common/utils/helper-functions'
import { has, get } from 'lodash'
import { versionType } from '@app/smart-wallets-service/smart-wallets/schemas/smart-wallet.schema'

@Injectable()
export class SmartWalletsEventsService {
  private readonly logger = new Logger(SmartWalletsEventsService.name)

  constructor (
    private readonly configService: ConfigService,
    private readonly centrifuge: Centrifuge,
    private readonly centClient: CentClient,
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
          case 'transactionHash':
            this.onTransactionHash(eventData)
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
    this.logger.log(`onCreateSmartWalletStarted: ${JSON.stringify(eventData)}`)
    try {
      const {
        smartWalletAddress,
        smartWalletUser,
        salt,
        walletModules
      } = eventData
      const {
        ownerAddress
      } = smartWalletUser

      if (!await this.smartWalletModel.findOne({ ownerAddress })) {
        this.smartWalletModel.create({
          salt,
          ownerAddress,
          walletModules,
          smartWalletAddress,
          walletOwnerOriginalAddress: ownerAddress,
          walletFactoryOriginalAddress: this.sharedAddresses.WalletFactory,
          walletFactoryCurrentAddress: this.sharedAddresses.WalletFactory,
          walletImplementationOriginalAddress: this.sharedAddresses.WalletImplementation,
          walletImplementationCurrentAddress: this.sharedAddresses.WalletImplementation,
          walletModulesOriginal: walletModules,
          networks: ['fuse'],
          version: this.walletVersion,
          versionType: get(eventData, 'versionType', versionType.V2),
          paddedVersion: this.walletPaddedVersion
        })

        await this.publishMessage(eventData, {
          eventName: websocketEvents.WALLET_CREATION_STARTED,
          eventData: {}
        })
      }
    } catch (error) {
      this.logger.error(`An error occurred during create smart wallet. ${error}`)
    }
  }

  async onTransactionHash (eventData: any) {
    await this.publishMessage(eventData, {
      eventName: websocketEvents.TRANSACTION_HASH,
      eventData
    })
  }

  async onCreateSmartWalletSuccess (eventData: any) {
    this.logger.log(`onCreateSmartWalletSuccess: ${JSON.stringify(eventData)}`)
    try {
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
      await this.publishMessage(eventData, {
        eventName: websocketEvents.WALLET_CREATION_SUCCEEDED,
        eventData: data
      })
      this.unsubscribe(eventData)
    } catch (error) {
      this.logger.error(`An error occurred during find and update smart wallet. ${error}`)
    }
  }

  async onCreateSmartWalletFailed (eventData: any) {
    await this.publishMessage(eventData, {
      eventName: websocketEvents.WALLET_CREATION_FAILED
    })
    this.unsubscribe(eventData)
  }

  async onRelaySuccess (eventData: any) {
    await this.publishMessage(eventData, {
      eventName: websocketEvents.TRANSACTION_SUCCEEDED,
      eventData
    })
    this.unsubscribe(eventData)
  }

  async onRelayFailed (eventData: any) {
    await this.publishMessage(eventData, {
      eventName: websocketEvents.TRANSACTION_FAILED,
      eventData
    })
    this.unsubscribe(eventData)
  }

  async onRelayStarted (eventData: any) {
    await this.publishMessage(eventData, {
      eventName: websocketEvents.TRANSACTION_STARTED,
      eventData
    })
  }

  async publishMessage (eventData, messageData) {
    try {
      if (!has(eventData, 'transactionId')) {
        return
      }
      const { transactionId } = eventData
      await this.centClient.publish({ channel: `transaction:#${transactionId}`, data: messageData })
    } catch (error) {
      this.logger.error({ error })
      this.logger.error(`An error occurred during publish message to channel: transaction:# eventData: ${JSON.stringify(eventData)}`)
    }
  }

  async unsubscribe (eventData) {
    try {
      if (!has(eventData, 'transactionId')) {
        return
      }
      await sleep(500)
      const { smartWalletAddress, transactionId } = eventData
      const { ownerAddress } = await this.smartWalletModel.findOne({ smartWalletAddress })
      await this.centClient.unsubscribe({ channel: `transaction:#${transactionId}`, user: ownerAddress })
    } catch (error) {
      this.logger.error({ error })
      this.logger.error(`An error occurred during publish message to channel: transaction:# eventData: ${JSON.stringify(eventData)}`)
    }
  }
}
