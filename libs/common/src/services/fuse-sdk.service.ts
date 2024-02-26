import { Injectable, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { FuseSDK } from '@fuseio/fusebox-web-sdk'
import { ethers } from 'ethers'

@Injectable()
export default class FuseSdkService implements OnModuleInit {
  private fuseSdk: FuseSDK | null = null

  constructor (private readonly configService: ConfigService) { }

  async onModuleInit (): Promise<void> {
    await this.init()
  }

  private async init (): Promise<void> {
    if (!this.fuseSdk) {
      this.fuseSdk = await FuseSDK.init(
        this.configService.get('fuseSdkApiKey'),
        new ethers.Wallet(this.configService.get('fuseSdkPrivateKey'))
      )
    }
  }

  getSdk (): FuseSDK {
    if (!this.fuseSdk) {
      throw new Error('FuseSDK has not been initialized yet.')
    }
    return this.fuseSdk
  }

  async getPriceForTokenAddress (tokenAddress: string) {
    return await this.fuseSdk.tradeModule.price(tokenAddress)
  }
}
