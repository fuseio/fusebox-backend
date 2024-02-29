import { Injectable, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { FuseSDK } from '@fuseio/fusebox-web-sdk'
import { ethers } from 'ethers'

@Injectable()
export default class FuseSdkService implements OnModuleInit {
  private fuseSdk: FuseSDK

  constructor (private readonly configService: ConfigService) { }

  async onModuleInit (): Promise<void> {
    await this.init()
  }

  private async init (): Promise<void> {
    try {
      const apiKey = this.configService.getOrThrow('fuseSdkApiKey')
      const privateKey = this.configService.getOrThrow('fuseSdkPrivateKey')
      this.fuseSdk = await FuseSDK.init(
        apiKey,
        new ethers.Wallet(privateKey)
      )
    } catch (error) {
      console.error('Failed to initialize FuseSDK:', error)
      throw error
    }
  }

  getSdk (): FuseSDK {
    if (!this.fuseSdk) {
      throw new Error('FuseSDK has not been initialized yet.')
    }
    return this.fuseSdk
  }

  async getPriceForTokenAddress (tokenAddress: string): Promise<any> {
    try {
      return await this.fuseSdk.tradeModule.price(tokenAddress)
    } catch (error) {
      console.error('Failed to get price for token address:', error)
      throw error // Or handle it more gracefully
    }
  }
}
