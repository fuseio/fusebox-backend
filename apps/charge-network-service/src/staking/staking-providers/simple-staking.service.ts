import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  Contract,
  InjectEthersProvider,
  Interface,
  JsonRpcProvider,
  formatUnits,
  parseUnits
} from 'nestjs-ethers'
import { StakingOption, StakingProvider } from '../interfaces'
import { UnstakeDto } from '../dto/unstake.dto'
import MasterChefV3ABI from '@app/network-service/common/constants/abi/MasterChefV3.json'
import TradeService from '@app/common/token/trade.service'
import { StakeDto } from '../dto/stake.dto'
import GraphService from '../graph.service'
import { GET_SIMPLE_STAKING_POOL_DATA as getSimpleStakingPoolData } from '@app/network-service/common/constants/graph-queries/masterchef-v3'
import { PoolConfig } from '@app/network-service/common/constants/simple-staking-config'

@Injectable()
export default class SimpleStakingService implements StakingProvider {
  private readonly logger = new Logger(SimpleStakingService.name)

  constructor (
    @InjectEthersProvider('regular-node')
    private readonly provider: JsonRpcProvider,
    private readonly configService: ConfigService,
    private readonly tradeService: TradeService,
    private readonly graphService: GraphService
  ) {}

  private readonly SECONDS_IN_MONTH = 60 * 60 * 24 * 30

  get address () {
    return this.configService.get('masterChefV3Address')
  }

  get masterChefV3Interface () {
    return new Interface(MasterChefV3ABI)
  }

  private getPoolId (tokenAddress: string): number {
    const poolConfig = this.getPoolsConfig()
    const config = poolConfig[tokenAddress.toLowerCase()]
    return config.poolId
  }

  private getPoolsConfig (): Record<string, PoolConfig> {
    return this.configService.get('simpleStakingConfig')
  }

  stake (stakeDto: StakeDto) {
    const poolsConfig = this.getPoolsConfig()
    const poolConfig = poolsConfig[stakeDto.tokenAddress.toLowerCase()]

    return this.masterChefV3Interface.encodeFunctionData('deposit', [
      poolConfig.poolId,
      parseUnits(stakeDto.tokenAmount, poolConfig.decimals)
    ])
  }

  unStake ({ tokenAddress, tokenAmount }: UnstakeDto) {
    const poolsConfig = this.getPoolsConfig()
    const poolConfig = poolsConfig[tokenAddress.toLowerCase()]

    return this.masterChefV3Interface.encodeFunctionData('withdraw', [
      poolConfig.poolId,
      parseUnits(tokenAmount, poolConfig.decimals)
    ])
  }

  async stakedToken (accountAddress: string, stakingOption: StakingOption) {
    try {
      const masterChefContract = new Contract(
        this.address,
        MasterChefV3ABI,
        this.provider
      )

      const poolId = this.getPoolId(stakingOption.tokenAddress)

      const [userInfo, pendingTokens] = await Promise.all([
        masterChefContract.userInfo(poolId, accountAddress),
        masterChefContract.pendingTokens(poolId, accountAddress)
      ])

      const stakedAmount = Number(formatUnits(userInfo.amount, stakingOption.decimals))

      const tokenPrice = await this.tradeService.getTokenPriceByAddress(
        stakingOption.tokenAddress
      )
      const stakedAmountUSD = stakedAmount * tokenPrice

      const pendingBonusTokenAmount = Number(
        formatUnits(pendingTokens[3], stakingOption.decimals)
      )

      const earnedAmountUSD = pendingBonusTokenAmount * tokenPrice
      const stakingApr = await this.stakingApr(stakingOption)

      return {
        ...stakingOption,
        stakedAmount,
        stakedAmountUSD,
        earnedAmountUSD,
        stakingApr
      }
    } catch (error) {
      this.logger.error(`stakedToken error: ${error}`)
      throw error
    }
  }

  async stakingApr (stakingOption: StakingOption) {
    try {
      const poolId = this.getPoolId(stakingOption.tokenAddress)

      type SimpleStakingPool = {
        pool: {
          balance: string
          rewarder: {
            tokenPerSec: string
          }
        }
      }

      const result = await this.graphService
        .getMasterChefV3Client()
        .request<SimpleStakingPool>(getSimpleStakingPoolData, { poolId })

      const pool = result.pool
      const tokenPerSec = formatUnits(pool.rewarder.tokenPerSec, stakingOption.decimals)
      const balance = formatUnits(pool.balance, stakingOption.decimals)

      const rewardsPerYear =
        parseFloat(tokenPerSec) * this.SECONDS_IN_MONTH * 12

      const totalStaked = parseFloat(balance)

      const tokenPrice = await this.tradeService.getTokenPriceByAddress(
        stakingOption.tokenAddress
      )

      const rewardsPerYearUSD = rewardsPerYear * tokenPrice
      const totalStakedUSD = totalStaked * tokenPrice

      return (rewardsPerYearUSD / totalStakedUSD) * 100
    } catch (error) {
      this.logger.error(`stakingApr error: ${error}`)
    }
  }

  async tvl (stakingOption: StakingOption) {
    try {
      const poolsConfig = this.getPoolsConfig()
      const poolConfig = poolsConfig[stakingOption.tokenAddress.toLowerCase()]

      const masterChefContract = new Contract(
        this.address,
        MasterChefV3ABI,
        this.provider
      )

      const poolInfo = await masterChefContract.poolInfo(poolConfig.poolId)

      const lpToken = new Contract(
        poolInfo.lpToken,
        ['function balanceOf(address) view returns (uint256)'],
        this.provider
      )

      const balance = await lpToken.balanceOf(this.address)

      const tokenPrice = await this.tradeService.getTokenPriceByAddress(
        poolInfo.lpToken
      )

      const formattedBalance = formatUnits(balance, poolConfig.decimals)
      return Number(formattedBalance) * tokenPrice
    } catch (error) {
      this.logger.error(`tvl error: ${error}`)
    }
  }
}
