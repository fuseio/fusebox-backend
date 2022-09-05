import VoltBarABI from '@app/network-service/common/constants/abi/VoltBar.json'
import { StakingOption, StakingProvider } from '../interfaces'
import { StakeDto } from '../dto/stake.dto'
import { encodeFunctionCall } from '@app/network-service/common/utils/helper-functions'
import { UnstakeDto } from '../dto/unstake.dto'
import { Injectable } from '@nestjs/common'
import Web3ProviderService from '@app/common/services/web3-provider.service'
import GraphService from '@app/common/services/graph.service'
import { ConfigService } from '@nestjs/config'
import { voltBarId } from '@app/network-service/common/constants/staking-providers'
import TradeService from '@app/common/services/trade.service'
import { getBarUser } from '@app/network-service/common/constants/graphql-queries'

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

  stakingApr () {
    // TODO: apr
    return new Promise<number>((resolve) => resolve(0))
  }

  private async getStakingData (accountAddress: string) {
    const data = await this.voltBarGraphClient.request(getBarUser, {
      barId: this.address.toLowerCase(),
      userId: accountAddress.toLowerCase()
    })

    return data
  }
}
