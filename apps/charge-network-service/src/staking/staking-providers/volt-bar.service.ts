import VoltBarABI from '@app/network-service/common/constants/abi/VoltBar.json'
import { StakingOption, StakingProvider } from '@app/network-service/staking/interfaces'
import { StakeDto } from '@app/network-service/staking/dto/stake.dto'
import { UnstakeDto } from '@app/network-service/staking/dto/unstake.dto'
import Erc20ABI from '@app/network-service/common/constants/abi/Erc20.json'
import { Injectable, Logger } from '@nestjs/common'
import { InjectEthersProvider } from 'nestjs-ethers'
import GraphService from '@app/network-service/staking/graph.service'
import { ConfigService } from '@nestjs/config'
import { daysInYear, voltBarId } from '@app/network-service/common/constants'
import TradeService from '@app/common/services/trade.service'
import { getBarStats, getBarUser } from '@app/network-service/common/constants/graph-queries/voltbar'
import { secondsInDay } from 'date-fns/constants'
import { getUnixTime } from 'date-fns'
import { Contract, Interface, JsonRpcProvider, formatEther, parseEther } from 'ethers'

@Injectable()
export default class VoltBarService implements StakingProvider {
  private readonly logger = new Logger(VoltBarService.name)

  constructor (
    @InjectEthersProvider('regular-node')
    private readonly provider: JsonRpcProvider,
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
    const iface = new Interface(VoltBarABI)
    return iface.encodeFunctionData('enter', [parseEther(tokenAmount)])
  }

  unStake ({ tokenAmount }: UnstakeDto) {
    const iface = new Interface(VoltBarABI)
    return iface.encodeFunctionData('leave', [parseEther(tokenAmount)])
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
    try {
      const voltTokenContract = new Contract(tokenAddress, Erc20ABI, this.provider)
      const voltBalance = await voltTokenContract.balanceOf(this.address)
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
