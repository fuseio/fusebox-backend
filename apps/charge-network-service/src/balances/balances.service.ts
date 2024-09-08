import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { UnmarshalService } from 'apps/charge-network-service/src/balances/services/unmarshal-balance.service'
import { ExplorerService } from 'apps/charge-network-service/src/balances/services/explorer-balance.service'
import { BalanceService } from 'apps/charge-network-service/src/balances/interfaces/balances.interface'
import { BaseProvider, Contract, EthersContract, InjectContractProvider, InjectEthersProvider } from 'nestjs-ethers'
import BasicTokenAbi from '@app/smart-wallets-service/common/config/abi/BasicToken.json'
import { NATIVE_FUSE_TOKEN } from '@app/smart-wallets-service/common/constants/fuseTokenInfo'

@Injectable()
export default class BalancesService {
  private readonly logger = new Logger(BalancesService.name)

  constructor (
    private readonly configService: ConfigService,
    private readonly unmarshalService: UnmarshalService,
    private readonly explorerService: ExplorerService,
    @InjectEthersProvider('regular-node')
    private readonly rpcProvider: BaseProvider,
    @InjectContractProvider('regular-node')
    private readonly ethersContract: EthersContract
  ) {}

  private get primaryService (): BalanceService {
    const primaryService = this.configService.get('primaryService')
    return primaryService === 'explorer' ? this.explorerService : this.unmarshalService
  }

  private get fallbackService (): BalanceService {
    const primaryService = this.configService.get('primaryService')
    return primaryService === 'explorer' ? this.unmarshalService : this.explorerService
  }

  private async getTokenInfo (address: string, tokenAddress?: string) {
    const isNativeToken = !tokenAddress || tokenAddress.toLowerCase() === NATIVE_FUSE_TOKEN.address.toLowerCase()
    const tokenInfo = isNativeToken ? await this.getNativeTokenInfo(address) : await this.getERC20TokenInfo(address, tokenAddress)

    return tokenInfo.balance === '0' ? null : tokenInfo
  }

  private async getNativeTokenInfo (address: string) {
    const balance = (await this.rpcProvider.getBalance(address)).toString()
    return {
      balance,
      contractAddress: NATIVE_FUSE_TOKEN.address.toLowerCase(),
      decimals: '18',
      name: 'Fuse',
      symbol: 'FUSE',
      type: 'native' as const
    }
  }

  private async getERC20TokenInfo (address: string, tokenAddress: string) {
    const contract: Contract = this.ethersContract.create(tokenAddress, BasicTokenAbi)
    const [balance, decimals, name, symbol] = await Promise.all([
      contract.balanceOf(address),
      contract.decimals(),
      contract.name(),
      contract.symbol()
    ])

    return {
      balance: balance.toString(),
      contractAddress: tokenAddress.toLowerCase(),
      decimals,
      name,
      symbol,
      type: 'ERC-20' as const
    }
  }

  async getERC20TokenBalances (address: string, tokenAddress?: string) {
    if (tokenAddress) {
      return this.getSingleTokenBalance(address, tokenAddress.toLowerCase())
    }

    return this.getMultipleTokenBalances(address)
  }

  private async getSingleTokenBalance (address: string, tokenAddress: string) {
    try {
      const tokenInfo = await this.getTokenInfo(address, tokenAddress)
      return {
        message: 'OK',
        result: tokenInfo ? [tokenInfo] : [],
        status: '1'
      }
    } catch (error) {
      this.logger.error(`Error fetching token balance: ${error.message}`, error.stack)
      return { message: 'OK', result: [], status: '0' }
    }
  }

  private async getMultipleTokenBalances (address: string) {
    try {
      const result = await this.primaryService.getERC20TokenBalances(address)
      this.logger.log(`Successfully fetched ERC20 token balances for address: ${address}`)
      return result
    } catch (error) {
      this.logger.error(`Failed to fetch ERC20 token balances from primary service for address: ${address}. Error: ${error.message}`)
      try {
        const fallbackResult = await this.fallbackService.getERC20TokenBalances(address)
        this.logger.log(`Successfully fetched ERC20 token balances from fallback service for address: ${address}`)
        return fallbackResult
      } catch (fallbackError) {
        this.logger.error(`Fallback service also failed for ERC20 token balances. Address: ${address}. Error: ${fallbackError.message}`)
        throw fallbackError
      }
    }
  }

  async getERC721TokenBalances (address: string, limit?: number, cursor?: string) {
    try {
      const result = await this.primaryService.getERC721TokenBalances(address, limit, cursor)
      this.logger.log(`Successfully fetched ERC721 token balances for address: ${address}`)
      return result
    } catch (error) {
      this.logger.error(`Failed to fetch ERC721 token balances from primary service for address: ${address}. Error: ${error.message}`)
      try {
        const fallbackResult = await this.fallbackService.getERC721TokenBalances(address, limit, cursor)
        this.logger.log(`Successfully fetched ERC721 token balances from fallback service for address: ${address}`)
        return fallbackResult
      } catch (fallbackError) {
        this.logger.error(`Fallback service also failed for ERC721 token balances. Address: ${address}. Error: ${fallbackError.message}`)
        throw fallbackError
      }
    }
  }
}
