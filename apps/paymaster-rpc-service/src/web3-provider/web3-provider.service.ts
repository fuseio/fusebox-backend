import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Web3 from 'web3'

@Injectable()
export class Web3ProviderService {
  private readonly provider: Web3

  constructor (private configService: ConfigService) {
    this.provider = new Web3(this.configService.getOrThrow('RPC_URL'))
  }

  getProvider () {
    return this.provider
  }
}
