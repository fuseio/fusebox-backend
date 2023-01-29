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

  get walletVersion () {
    return this.configService.get('version')
  }

  get walletPaddedVersion () {
    return this.configService.get('paddedVersion')
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
    return this.smartAccountModel.findOne({ ownerAddress })
  }

  async createWallet (smartAccountUser: ISmartAccountUser) {
    try {
      const { ownerAddress, projectId } = smartAccountUser
      if (await this.smartAccountModel.findOne({ ownerAddress })) {
        throw new Error('Owner address already has a deployed smart account')
      }
      const salt = generateSalt()
      const transactionId = generateTransactionId(salt)
      const walletModules = this.sharedAddresses.walletModules
      const { job } = await this.relayAPIService.createWallet({
        v2: true,
        salt,
        transactionId,
        owner: ownerAddress,
        walletModules,
        WalletFactory: this.sharedAddresses.WalletFactory
      })
      const smartAccountAddress = job.data.walletAddress
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
        walletPaddedVersion: this.walletPaddedVersion
      })
      // Todo: Think about the response object, we may need to return a certain id for tracking with WS
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
