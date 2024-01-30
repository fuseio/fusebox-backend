import { SmartWalletsAuthDto } from '@app/smart-wallets-service/dto/smart-wallets-auth.dto'
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { arrayify, computeAddress, hashMessage, recoverPublicKey } from 'nestjs-ethers'
import { SmartWalletService } from '@app/smart-wallets-service/smart-wallets/interfaces/smart-wallets.interface'
import { ConfigService } from '@nestjs/config'
import { ChargeApiService } from '@app/apps-service/charge-api/charge-api.service'

@Injectable()
export class SmartWalletsAAService implements SmartWalletService {
  private readonly logger = new Logger(SmartWalletsAAService.name)

  constructor (
    private readonly jwtService: JwtService,
    private configService: ConfigService,
    private chargeApiService: ChargeApiService
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
        await this.subscribeWalletToNotifications(smartWalletAddress)

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
}
