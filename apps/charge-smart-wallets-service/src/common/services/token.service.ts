import { NATIVE_FUSE_TOKEN } from '@app/smart-wallets-service/common/constants/fuseTokenInfo'
import { Token } from '@app/smart-wallets-service/data-layer/interfaces/token-interfaces'
import { Injectable } from '@nestjs/common'
import Web3ProviderService from '@app/common/services/web3-provider.service'
const BasicTokenAbi = require('@app/smart-wallets-service/common/config/abi/BasicToken.json')

@Injectable()
export class TokenService {
  constructor (
    private readonly web3ProviderService: Web3ProviderService

  ) { }

  async fetchTokenDetails (address: string): Promise<Token> {
    if (address === NATIVE_FUSE_TOKEN.address) {
      return {
        name: NATIVE_FUSE_TOKEN.name,
        address: NATIVE_FUSE_TOKEN.address,
        symbol: NATIVE_FUSE_TOKEN.symbol,
        decimals: 18
      }
    }
    const web3 = this.web3ProviderService.getProvider()
    const tokenContractInstance = new web3.eth.Contract(BasicTokenAbi, address)
    try {
      const [name, symbol, decimals] = await Promise.all([
        tokenContractInstance.methods.name().call<string>(),
        tokenContractInstance.methods.symbol().call<string>(),
        tokenContractInstance.methods.decimals().call<string>()
      ])
      const fetchedTokedData: Token = { name, symbol, decimals: parseInt(decimals), address }
      return fetchedTokedData
    } catch (error) {
      const decimals = 0
      const [name, symbol] = await Promise.all([
        tokenContractInstance.methods.name().call<string>(),
        tokenContractInstance.methods.symbol().call<string>()
      ])
      const fetchedTokedData: Token = { name, symbol, decimals, address }
      return fetchedTokedData
    }
  }
}
