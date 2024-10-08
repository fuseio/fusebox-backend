import { Model } from 'mongoose'
import { SmartWalletsAuthDto } from '@app/smart-wallets-service/dto/smart-wallets-auth.dto'
import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { arrayify, computeAddress, hashMessage, recoverPublicKey } from 'nestjs-ethers'
import { ConfigService } from '@nestjs/config'
import { smartWalletString } from '@app/smart-wallets-service/smart-wallets/smart-wallets.constants'
import { SmartWallet, SmartWalletService } from '@app/smart-wallets-service/smart-wallets/interfaces/smart-wallets.interface'
import { generateSalt, generateTransactionId } from 'apps/charge-smart-wallets-service/src/common/utils/helper-functions'
import RelayAPIService from 'apps/charge-smart-wallets-service/src/common/services/relay-api.service'
import { RelayDto } from '@app/smart-wallets-service/smart-wallets/dto/relay.dto'
import { ISmartWalletUser } from '@app/common/interfaces/smart-wallet.interface'
import { CentClient } from 'cent.js'

@Injectable()
export class SmartWalletsLegacyService implements SmartWalletService {
  private readonly logger = new Logger(SmartWalletsLegacyService.name)

  constructor (
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly relayAPIService: RelayAPIService,
    private readonly centClient: CentClient,
    @Inject(smartWalletString)
    private smartWalletModel: Model<SmartWallet>
  ) { }

  get sharedAddresses () {
    return this.configService.get('sharedAddresses')
  }

  get wsUrl () {
    return this.configService.get('wsUrl')
  }

  async auth (smartWalletsAuthDto: SmartWalletsAuthDto) {
    try {
      const publicKey = recoverPublicKey(arrayify(hashMessage(arrayify(smartWalletsAuthDto.hash))), smartWalletsAuthDto.signature)
      const recoveredAddress = computeAddress(publicKey)

      if (recoveredAddress === smartWalletsAuthDto.ownerAddress) {
        const jwt = this.jwtService.sign({
          sub: recoveredAddress,
          info: {
            ownerAddress: recoveredAddress
          },
          channels: ['transaction']
        })
        return { jwt }
      } else {
        throw new Error('Owner Address does not match recovered address in signature')
      }
    } catch (err) {
      this.logger.error(`An error occurred during Smart Wallets Auth. ${err}`)
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST)
    }
  }

  async getWallet (smartWalletUser: ISmartWalletUser) {
    try {
      const { ownerAddress } = smartWalletUser
      this.logger.log(`Fetching Smart Wallet for owner address: ${ownerAddress}`)
      const smartWallet = await this.smartWalletModel.findOne({ ownerAddress })
      if (!smartWallet) {
        this.logger.warn(`Smart Wallet not found for owner address: ${ownerAddress}`)
        throw new Error('Not found')
      }
      if (!smartWallet.isContractDeployed) {
        this.logger.log(`Smart Wallet not deployed for owner address: ${ownerAddress}, deploying...`)
        const transactionId = generateTransactionId(smartWallet.salt)
        const walletModules = this.sharedAddresses.walletModules
        this.relayAPIService.createWallet({
          v2: true,
          salt: smartWallet.salt,
          transactionId,
          smartWalletUser,
          owner: ownerAddress,
          walletModules,
          walletFactoryAddress: this.sharedAddresses.WalletFactory
        }).catch(err => {
          const errorMessage = `Retry wallet creation failed: ${err}`
          this.logger.error(errorMessage)
        })
      }

      const {
        smartWalletAddress,
        walletModules,
        networks,
        version,
        paddedVersion
      } = smartWallet

      this.logger.log(`Smart Wallet found for owner address: ${ownerAddress}`)
      return {
        smartWalletAddress,
        walletModules,
        networks,
        version,
        paddedVersion,
        ownerAddress
      }
    } catch (err) {
      this.logger.error(`An error occurred during fetching Legacy Smart Wallet. ${err}`)
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST)
    }
  }

  async createWallet (smartWalletUser: ISmartWalletUser) {
    try {
      const { ownerAddress } = smartWalletUser
      if (await this.smartWalletModel.findOne({ ownerAddress })) {
        throw new Error('Owner address already has a deployed smart wallet')
      }
      const salt = generateSalt()
      const transactionId = generateTransactionId(salt)
      const walletModules = this.sharedAddresses.walletModules
      await this.centClient.subscribe({ channel: `transaction:#${transactionId}`, user: ownerAddress })
      this.relayAPIService.createWallet({
        v2: true,
        salt,
        transactionId,
        smartWalletUser,
        owner: ownerAddress,
        walletModules,
        walletFactoryAddress: this.sharedAddresses.WalletFactory
      })
      return {
        connectionUrl: this.wsUrl,
        transactionId
      }
    } catch (err) {
      this.logger.error(`An error occurred during Smart Wallets Creation. ${err}`)
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST)
    }
  }

  async relay (relayDto: RelayDto) {
    try {
      const transactionId = generateTransactionId(relayDto.data)
      await this.centClient.subscribe({ channel: `transaction:#${transactionId}`, user: relayDto.ownerAddress })
      this.relayAPIService.relay({
        v2: true,
        transactionId,
        ...relayDto
      })
      return {
        connectionUrl: this.wsUrl,
        transactionId
      }
    } catch (err) {
      this.logger.error(`An error occurred during relay execution. ${err}`)
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST)
    }
  }

  async getHistoricalTxs (user: ISmartWalletUser) {
    try {
      const { smartWalletAddress } = await this.smartWalletModel.findOne({ ownerAddress: user.ownerAddress })
      const result = await this.relayAPIService.getHistoricalTxs(smartWalletAddress, user.query)
      return {
        ...result
      }
    } catch (error) {
      this.logger.error(`An error occurred during fetching historical txs. ${error}`)
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  // TODO
  async getAvailableUpgrades () {
  }

  // TODO
  async installUpgrade () {
  }
}
