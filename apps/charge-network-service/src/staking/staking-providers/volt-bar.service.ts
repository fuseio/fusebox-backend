import VoltBarABI from '@app/network-service/common/constants/abi/VoltBar.json'
import { StakingOption, StakingProvider } from '@app/network-service/staking/interfaces'
import { StakeDto } from '@app/network-service/staking/dto/stake.dto'
import { encodeFunctionCall } from '@app/network-service/common/utils/helper-functions'
import { UnstakeDto } from '@app/network-service/staking/dto/unstake.dto'
import Erc20ABI from '@app/network-service/common/constants/abi/Erc20.json'
import { Injectable, Logger } from '@nestjs/common'
import Web3ProviderService from '@app/common/services/web3-provider.service'
import GraphService from '@app/network-service/staking/graph.service'
import { ConfigService } from '@nestjs/config'
import { daysInYear, voltBarId } from '@app/network-service/common/constants'
import TradeService from '@app/common/services/trade.service'
import { getBarStats, getBarUser } from '@app/network-service/common/constants/graph-queries/voltbar'
import { secondsInDay } from 'date-fns/constants'
import { getUnixTime } from 'date-fns'
import { formatEther } from 'nestjs-ethers'

@Injectable()
export default class VoltBarService implements StakingProvider {
  private readonly logger = new Logger(VoltBarService.name)

  constructor (
    private readonly web3ProviderService: Web3ProviderService,
    private readonly graphService: GraphService,
    private readonly configService: ConfigService,
    private readonly tradeService: TradeService
  ) { }

  get address () {
    return this.configService.get('voltBarAddress')
  }

  get stakingProviderId () {
    return voltBarId
  }

  get web3Provider () {
    return this.web3ProviderService.getProvider()
  }

  get voltBarGraphClient () {
    return this.graphService.getVoltBarClient()
  }

  get voltageClient () {
    return this.graphService.getVoltageClient()
  }

  get blockClient () {
    return this.graphService.getBlockClient()
  }

  stake ({ tokenAmount }: StakeDto) {
    return encodeFunctionCall(
      VoltBarABI,
      this.web3Provider,
      'enter',
      [this.web3Provider.utils.toWei(tokenAmount)]
    )
  }

  unStake ({ tokenAmount }: UnstakeDto) {
    return encodeFunctionCall(
      VoltBarABI,
      this.web3Provider,
      'leave',
      [this.web3Provider.utils.toWei(tokenAmount)]
    )
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
      const stakingData: any = await this.getStakingData(accountAddress)

      const voltPrice = await this.tradeService.getTokenPrice(tokenAddress)

      const stakedAmount = Number(stakingData?.user?.xVolt ?? 0) * Number(stakingData?.bar?.ratio ?? 0)
      const stakedAmountUSD = stakedAmount * voltPrice
      const earnedAmountUSD = 0

      const stakingApr = await this.stakingApr()

      return {
        tokenAddress,
        tokenLogoURI,
        tokenName,
        tokenSymbol,
        unStakeTokenAddress,
        stakedAmount,
        stakedAmountUSD,
        earnedAmountUSD,
        stakingApr
      }
    } catch (error) {
      // Add additional error handling or rethrow the error as needed
      this.logger.error('Error in staking data retrieval:', error)
    }
  }

  async stakingApr () {
    const days = 31
    const latestTimestamp = getUnixTime(new Date())
    const startTimestamp = (latestTimestamp / secondsInDay) - days
    try {
      const stats: any = await this.voltBarGraphClient.request(getBarStats, {
        days,
        startTimestamp: String(startTimestamp)
      })
      const voltBalanceHistories = stats?.voltBalanceHistories || []
      const bars = stats?.bars || []

      const totalStaked = bars?.[0]?.totalSupply

      const movingAverage = voltBalanceHistories
        .map((history: any, index: number, histories: any[]) => {
          if (index === 0) return 0
          return history.balance - history.totalVoltStaked - (histories[index - 1].balance - histories[index - 1].totalVoltStaked)
        })
        .reduce((totalAverage: number, history: number) => totalAverage + history, 0) / voltBalanceHistories.length - 1

      return (movingAverage * daysInYear * 100) / totalStaked
    } catch (error) {
      this.logger.error(`stakingApr error: ${error}`)
      this.logger.error(`stakingApr query:${getBarStats}`)
      this.logger.error(`arguments: ${startTimestamp}`)
    }
  }

  async tvl ({ tokenAddress }: StakingOption) {
    const voltTokenContract = new this.web3Provider.eth.Contract(Erc20ABI as any, tokenAddress)
    try {
      const voltBalance = await voltTokenContract.methods.balanceOf(this.address).call()
      const voltPrice = await this.tradeService.getTokenPrice(tokenAddress)
      return Number(formatEther(voltBalance)) * voltPrice
    } catch (error) {
      this.logger.error(`tvl error: ${error}`)
      this.logger.error(`params: ${tokenAddress}`)
    }
  }

  private async getStakingData (accountAddress: string) {
    try {
      const data = await this.voltBarGraphClient.request(getBarUser, {
        barId: this.address.toLowerCase(),
        userId: accountAddress.toLowerCase()
      })

      return data
    } catch (error) {
      this.logger.error(`getStakingData error: ${error}`)
      this.logger.error(`gatStakingData error query: ${getBarUser}`)
      this.logger.error({
        barId: this.address,
        userId: accountAddress
      })
    }
  }
}
