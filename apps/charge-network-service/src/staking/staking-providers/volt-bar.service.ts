import VoltBarABI from '@app/network-service/common/constants/abi/VoltBar.json'
import { StakingOption, StakingProvider } from '@app/network-service/staking/interfaces'
import { StakeDto } from '@app/network-service/staking/dto/stake.dto'
import { encodeFunctionCall } from '@app/network-service/common/utils/helper-functions'
import { UnstakeDto } from '@app/network-service/staking/dto/unstake.dto'
import { Injectable } from '@nestjs/common'
import Web3ProviderService from '@app/common/services/web3-provider.service'
import GraphService from '@app/network-service/staking/graph.service'
import { ConfigService } from '@nestjs/config'
import { daysInYear, voltBarId } from '@app/network-service/common/constants'
import TradeService from '@app/common/services/trade.service'
import { getBarStats, getBarUser } from '@app/network-service/common/constants/graph-queries/voltbar'
import { secondsInDay } from 'date-fns/constants'
import { getUnixTime } from 'date-fns'

@Injectable()
export default class VoltBarService implements StakingProvider {
  constructor (
    private readonly web3ProviderService: Web3ProviderService,
    private readonly graphService: GraphService,
    private readonly configService: ConfigService,
    private readonly tradeService: TradeService
  ) {}

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
    const stakingData = await this.getStakingData(accountAddress)
    const voltPrice = await this.tradeService.getTokenPrice(tokenAddress)

    const stakedAmount = Number(stakingData?.user?.xVolt ?? 0) * Number(stakingData?.bar?.ratio ?? 0)
    const stakedAmountUSD = stakedAmount * voltPrice
    const earnedAmountUSD = 0

    return {
      tokenAddress,
      tokenLogoURI,
      tokenName,
      tokenSymbol,
      unStakeTokenAddress,
      stakedAmount,
      stakedAmountUSD,
      earnedAmountUSD
    }
  }

  async stakingApr () {
    const days = 31
    const latestTimestamp = getUnixTime(new Date())
    const startTimestamp = (latestTimestamp / secondsInDay) - days

    const stats = await this.voltBarGraphClient.request(getBarStats, {
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
  }

  private async getStakingData (accountAddress: string) {
    const data = await this.voltBarGraphClient.request(getBarUser, {
      barId: this.address.toLowerCase(),
      userId: accountAddress.toLowerCase()
    })

    return data
  }
}
