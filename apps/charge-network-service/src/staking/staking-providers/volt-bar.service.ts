import VoltBarABI from '@app/network-service/common/constants/abi/VoltBar.json'
import { StakingOption, StakingProvider } from '@app/network-service/staking/interfaces'
import { StakeDto } from '@app/network-service/staking/dto/stake.dto'
import { encodeFunctionCall } from '@app/network-service/common/utils/helper-functions'
import { UnstakeDto } from '@app/network-service/staking/dto/unstake.dto'
import { Injectable } from '@nestjs/common'
import Web3ProviderService from '@app/common/services/web3-provider.service'
import GraphService from '@app/network-service/staking/graph.service'
import { ConfigService } from '@nestjs/config'
import { voltBarId } from '@app/network-service/common/constants/staking-providers'
import TradeService from '@app/common/services/trade.service'
import { getBar, getBarUser, getBlock, getFactories } from '@app/network-service/common/constants/graphql-queries'
import { startOfMinute, subDays, getUnixTime, addSeconds } from 'date-fns'

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

  async stakedToken (accountAddress: string, { tokenAddress, tokenLogoURI, tokenName, tokenSymbol }: StakingOption) {
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
      stakedAmount,
      stakedAmountUSD,
      earnedAmountUSD
    }
  }

  async stakingApr ({ tokenAddress }: StakingOption) {
    const date = startOfMinute(subDays(Date.now(), 1))
    const start = getUnixTime(date)
    const end = getUnixTime(addSeconds(date, 600))
    const block1d = await this.blockClient.request(getBlock, {
      timestampFrom: start,
      timestampTo: end
    })
    const factories = await this.voltageClient.request(getFactories, {
      blockNumber: Number(block1d?.blocks[0]?.number)
    })

    const bar = await this.voltBarGraphClient.request(getBar, { barId: this.address.toLowerCase() })
    const voltPrice = await this.tradeService.getTokenPrice(tokenAddress)

    const totalVolumeUSD = factories?.latestFactory?.[0]?.totalVolumeUSD
    const totalVolumeUSD1d = factories?.historicalFactory?.[0]?.totalVolumeUSD
    const xVoltSupply = bar?.bar?.totalSupply
    const xVoltPrice = voltPrice * bar?.bar?.ratio

    return (((totalVolumeUSD - totalVolumeUSD1d) * 0.0005 * 365) / (Number(xVoltSupply) * xVoltPrice)) * 100
  }

  private async getStakingData (accountAddress: string) {
    const data = await this.voltBarGraphClient.request(getBarUser, {
      barId: this.address.toLowerCase(),
      userId: accountAddress.toLowerCase()
    })

    return data
  }
}
