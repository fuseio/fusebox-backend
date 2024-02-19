import { SmartWalletsAuthDto } from '@app/smart-wallets-service/dto/smart-wallets-auth.dto'
import { Inject, HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { arrayify, computeAddress, hashMessage, recoverPublicKey } from 'nestjs-ethers'
import { SmartWalletService } from '@app/smart-wallets-service/smart-wallets/interfaces/smart-wallets.interface'
import { ConfigService } from '@nestjs/config'
import { ChargeApiService } from '@app/apps-service/charge-api/charge-api.service'
import { Model } from 'mongoose'
import { smartContractWalletString } from '@app/smart-wallets-service/smart-wallets/smart-wallets.constants'
import { SmartContractWallet } from '@app/smart-wallets-service/smart-wallets/interfaces/smart-contract-wallet.interface'

@Injectable()
export class SmartWalletsAAService implements SmartWalletService {
  private readonly logger = new Logger(SmartWalletsAAService.name)

  constructor (
    private readonly jwtService: JwtService,
    private configService: ConfigService,
    private chargeApiService: ChargeApiService,
    @Inject(smartContractWalletString)
    private smartContractWalletModel: Model<SmartContractWallet>
  ) { }

  async auth (smartWalletsAuthDto: SmartWalletsAuthDto) {
    try {
      const publicKey = recoverPublicKey(arrayify(hashMessage(arrayify(smartWalletsAuthDto.hash))), smartWalletsAuthDto.signature)
      const recoveredAddress = computeAddress(publicKey)
      const smartWalletAddress = smartWalletsAuthDto.smartWalletAddress

      if (recoveredAddress === smartWalletsAuthDto.ownerAddress && smartWalletAddress) {
        this.logger.debug('Signing the JWT...')
        const jwt = this.jwtService.sign({
          sub: smartWalletAddress,
          info: {
            smartWalletAddress: smartWalletsAuthDto.smartWalletAddress,
            ownerAddress: recoveredAddress
          },
          channels: ['transaction', 'walletAction', 'userOp']
        })

        try {
          await this.subscribeWalletToNotifications(smartWalletAddress)
        } catch (error) {
          this.logger.error(`An error occurred while subscribing wallet to notifications. ${error}`)
        }

        try {
          await this.storeSmartContractWallet(smartWalletsAuthDto)
        } catch (error) {
          this.logger.error(`An error occurred while storing smart contract wallet. ${error}`)
        }

        this.logger.debug('Returning the JWT...')
        return { jwt }
      } else {
        throw new Error('Owner Address does not match recovered address in signature')
      }
    } catch (err) {
      this.logger.error(`An error occurred during Smart Wallets Auth. ${err}`)
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST)
    }
  }

  private async subscribeWalletToNotifications (walletAddress: string) {
    this.logger.debug('Subscribing wallet to notifications...')
    const webhookId =
      this.configService.get('INCOMING_TOKEN_TRANSFERS_WEBHOOK_ID')
    return this.chargeApiService.addWebhookAddress({ walletAddress, webhookId })
  }

  private async storeSmartContractWallet (smartWalletsAuthDto: SmartWalletsAuthDto) {
    if (!await this.smartContractWalletModel.findOne({ smartWalletAddress: smartWalletsAuthDto.smartWalletAddress })) {
      await this.smartContractWalletModel.create({
        smartWalletAddress: smartWalletsAuthDto.smartWalletAddress,
        ownerAddress: smartWalletsAuthDto.ownerAddress,
        projectId: smartWalletsAuthDto.projectId
      })
    }
  }
}
