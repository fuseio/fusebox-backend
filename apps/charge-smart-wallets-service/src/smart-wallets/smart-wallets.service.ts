import { Model } from 'mongoose'
import { SmartWalletsAuthDto } from '@app/smart-wallets-service/dto/smart-wallets-auth.dto'
import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { arrayify, computeAddress, hashMessage, recoverPublicKey } from 'nestjs-ethers'
import { ConfigService } from '@nestjs/config'
import { smartWalletString } from '@app/smart-wallets-service/smart-wallets/smart-wallets.constants'
import { SmartWallet } from '@app/smart-wallets-service/smart-wallets/interfaces/smart-wallets.interface'
import { generateSalt, generateTransactionId } from 'apps/charge-smart-wallets-service/src/common/utils/helper-functions'
import RelayAPIService from 'apps/charge-smart-wallets-service/src/common/services/relay-api.service'
import { RelayDto } from '@app/smart-wallets-service/smart-wallets/dto/relay.dto'
import { ISmartWalletUser } from '@app/common/interfaces/smart-wallet.interface'
import CentrifugoAPIService from '@app/common/services/centrifugo.service'

@Injectable()
export class SmartWalletsService {
  private readonly logger = new Logger(SmartWalletsService.name)

  constructor (
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly relayAPIService: RelayAPIService,
    private readonly centrifugoAPIService: CentrifugoAPIService,
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
    const { ownerAddress } = smartWalletUser
    if (!await this.smartWalletModel.findOne({ ownerAddress })) {
      throw new Error('Not found')
    }
    return this.smartWalletModel.findOne({ ownerAddress }, {
      smartWalletAddress: 1,
      ownerAddress: 1,
      walletModules: 1,
      networks: 1,
      version: 1,
      paddedVersion: 1,
      _id: 0
    })
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
      await this.centrifugoAPIService.subscribe(`transaction:#${transactionId}`, ownerAddress)
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
      await this.centrifugoAPIService.subscribe(`transaction:#${transactionId}`, relayDto.ownerAddress)
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

  // TODO
  async getAvailableUpgrades () {
  }

  // TODO
  async installUpgrade () {
  }
}
