import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Web3 from 'web3'

@Injectable()
export default class Web3ProviderService {
  private readonly provider: Web3
  private config: any

  constructor(private configService: ConfigService) {
    const rpcUrl = this.configService.get('rpcConfig').rpc.url
    if (rpcUrl) {
      this.provider = new Web3(rpcUrl)
    } else {
      throw new Error('RPC URL is not defined in the config')
    }
  }

  getProvider() {
    return this.provider
  }

  setConfig(config: any) {
    this.config = config
  }
}
