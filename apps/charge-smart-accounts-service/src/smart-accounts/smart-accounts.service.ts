import { Model } from 'mongoose'
import { SmartAccountsAuthDto } from '@app/smart-accounts-service/dto/smart-accounts-auth.dto'
import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { arrayify, computeAddress, hashMessage, recoverPublicKey } from 'nestjs-ethers'
import { ConfigService } from '@nestjs/config'
import { smartAccountString } from '@app/smart-accounts-service/smart-accounts/smart-accounts.constants'
import { SmartAccount } from '@app/smart-accounts-service/smart-accounts/interfaces/smart-account.interface'
import { generateSalt, generateTransactionId } from '@app/smart-accounts-service/common/utils/helper-functions'
import RelayAPIService from '@app/smart-accounts-service/common/services/relay-api.service'
import { RelayDto } from '@app/smart-accounts-service/smart-accounts/dto/relay.dto'
import { ISmartAccountUser } from '@app/common/interfaces/smart-account.interface'

@Injectable()
export class SmartAccountsService {
  private readonly logger = new Logger(SmartAccountsService.name)

  constructor (
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly relayAPIService: RelayAPIService,
    @Inject(smartAccountString)
    private smartAccountModel: Model<SmartAccount>
  ) { }

  get sharedAddresses () {
    return this.configService.get('sharedAddresses')
  }

  async auth (smartAccountsAuthDto: SmartAccountsAuthDto) {
    try {
      const publicKey = recoverPublicKey(arrayify(hashMessage(arrayify(smartAccountsAuthDto.hash))), smartAccountsAuthDto.signature)
      const recoveredAddress = computeAddress(publicKey)

      if (recoveredAddress === smartAccountsAuthDto.ownerAddress) {
        const jwt = this.jwtService.sign({
          ownerAddress: recoveredAddress,
          projectId: smartAccountsAuthDto.projectId
        })
        return { jwt }
      } else {
        throw new Error('Owner Address does not match recovered address in signature')
      }
    } catch (err) {
      this.logger.error(`An error occurred during Smart Accounts Auth. ${err}`)
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST)
    }
  }

  async getWallet (smartAccountUser: ISmartAccountUser) {
    const { ownerAddress } = smartAccountUser
    return this.smartAccountModel.findOne({ ownerAddress }, {
      smartAccountAddress: 1,
      ownerAddress: 1,
      walletModules: 1,
      networks: 1,
      version: 1,
      paddedVersion: 1,
      _id: 0
    })
  }

  async createWallet (smartAccountUser: ISmartAccountUser) {
    try {
      const { ownerAddress } = smartAccountUser
      if (await this.smartAccountModel.findOne({ ownerAddress })) {
        throw new Error('Owner address already has a deployed smart account')
      }
      const salt = generateSalt()
      const transactionId = generateTransactionId(salt)
      const walletModules = this.sharedAddresses.walletModules
      this.relayAPIService.createWallet({
        v2: true,
        salt,
        transactionId,
        smartAccountUser,
        owner: ownerAddress,
        walletModules,
        WalletFactory: this.sharedAddresses.WalletFactory
      })
      return {
        transactionId
      }
    } catch (err) {
      this.logger.error(`An error occurred during Smart Accounts Creation. ${err}`)
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST)
    }
  }

  async relay (relayDto: RelayDto) {
    try {
      const transactionId = generateTransactionId(relayDto.methodData)
      this.relayAPIService.relay({
        v2: true,
        transactionId,
        ...relayDto
      })
      return {
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
