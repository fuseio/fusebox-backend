import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Web3 from 'web3'

@Injectable()
export default class Web3ProviderService {
  private readonly provider: Web3
  private readonly prodProvider: Web3
  private readonly sandboxProvider: Web3

  constructor (
        private configService: ConfigService

  ) {
    this.prodProvider = new Web3(this.configService.get('paymasterApi.production').url)
    this.sandboxProvider = new Web3(this.configService.get('paymasterApi.sandbox').url)
  }

  getProviderByEnv (env: string) {
    if (env === 'production') {
      return this.prodProvider
    }
    if (env === 'sandbox') {
      return this.sandboxProvider
    }
  }
}
