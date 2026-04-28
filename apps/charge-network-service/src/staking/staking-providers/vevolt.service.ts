import { StakingOption, StakingProvider } from '@app/network-service/staking/interfaces'
import { StakeDto } from '@app/network-service/staking/dto/stake.dto'
import { UnstakeDto } from '@app/network-service/staking/dto/unstake.dto'
import Erc20ABI from '@app/network-service/common/constants/abi/Erc20.json'
import VeVoltABI from '@app/network-service/common/constants/abi/VeVolt.json'
import { Injectable, Logger } from '@nestjs/common'
import {
  Contract,
  InjectEthersProvider,
  Interface,
  JsonRpcProvider,
  formatEther
} from 'nestjs-ethers'
import { ConfigService } from '@nestjs/config'
import { veVoltId } from '@app/network-service/common/constants'
import TradeService from '@app/common/token/trade.service'

@Injectable()
export default class VeVoltService implements StakingProvider {
  private readonly logger = new Logger(VeVoltService.name)

  constructor (
    @InjectEthersProvider('regular-node')
    private readonly provider: JsonRpcProvider,
    private readonly configService: ConfigService,
    private readonly tradeService: TradeService
  ) { }

  get address () {
    return this.configService.get('veVoltAddress')
  }

  get stakingProviderId () {
    return veVoltId
  }

  get vevoltInterface () {
    return new Interface(VeVoltABI)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  stake (_: StakeDto): string {
    throw new Error('veVOLT locking is not supported via the staking API')
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  unStake (_: UnstakeDto): string {
    return this.vevoltInterface.encodeFunctionData('force_withdraw', [])
  }

  async stakedToken (
    accountAddress: string,
    {
      tokenAddress,
      tokenLogoURI,
      tokenName,
      tokenSymbol,
      unStakeTokenAddress
    }: StakingOption) {
    try {
      const veVoltContract = new Contract(this.address, VeVoltABI, this.provider)
      const locked = await veVoltContract.locked(accountAddress)

      const stakedAmount = Number(formatEther(locked.amount))
      const voltPrice = await this.tradeService.getTokenPriceByAddress(tokenAddress)
      const stakedAmountUSD = stakedAmount * voltPrice

      return {
        tokenAddress,
        tokenLogoURI,
        tokenName,
        tokenSymbol,
        unStakeTokenAddress,
        stakedAmount,
        stakedAmountUSD,
        earnedAmountUSD: 0,
        stakingApr: 0
      }
    } catch (error) {
      this.logger.error(`stakedToken error: ${error}`)
      return {
        tokenAddress,
        tokenLogoURI,
        tokenName,
        tokenSymbol,
        unStakeTokenAddress,
        stakedAmount: 0,
        stakedAmountUSD: 0,
        earnedAmountUSD: 0,
        stakingApr: 0
      }
    }
  }

  async stakingApr () {
    return 0
  }

  async tvl ({ tokenAddress }: StakingOption) {
    try {
      const voltContract = new Contract(tokenAddress, Erc20ABI, this.provider)
      const totalLocked = await voltContract.balanceOf(this.address)
      const voltPrice = await this.tradeService.getTokenPriceByAddress(tokenAddress)
      return Number(formatEther(totalLocked)) * voltPrice
    } catch (error) {
      this.logger.error(`tvl error: ${error}`)
      return 0
    }
  }
}
