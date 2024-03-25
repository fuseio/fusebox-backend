import { NATIVE_FUSE_TOKEN } from '@app/smart-wallets-service/common/constants/fuseTokenInfo'
import { Token } from '@app/smart-wallets-service/data-layer/interfaces/token-interfaces'
import { Injectable } from '@nestjs/common'
import { Contract, JsonRpcProvider } from 'ethers'
import { InjectEthersProvider } from 'nestjs-ethers'
const BasicTokenAbi = require('@app/smart-wallets-service/common/config/abi/BasicToken.json')

@Injectable()
export class TokenService {
  constructor (
    @InjectEthersProvider('regular-node')
    private readonly provider: JsonRpcProvider
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
    const tokenContractInstance = new Contract(address, BasicTokenAbi, this.provider)
    try {
      const [name, symbol, decimals] = await Promise.all([
        tokenContractInstance.name(),
        tokenContractInstance.symbol(),
        tokenContractInstance.decimals()
      ])
      const fetchedTokedData: Token = { name, symbol, decimals: parseInt(decimals), address }
      return fetchedTokedData
    } catch (error) {
      const decimals = 0
      const [name, symbol] = await Promise.all([
        tokenContractInstance.name(),
        tokenContractInstance.symbol()
      ])
      const fetchedTokedData: Token = { name, symbol, decimals, address }
      return fetchedTokedData
    }
  }
}
