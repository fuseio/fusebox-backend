import { Injectable } from '@nestjs/common'
import Web3ProviderService from '@app/common/services/web3-provider.service'
import { UnstakeDto } from '@app/network-service/staking/dto/unstake.dto'
import { StakeDto } from '@app/network-service/staking/dto/stake.dto'
import { StakingOption, StakingProvider } from './interfaces'
import VoltBarService from './staking-providers/volt-bar.service'
import { voltBarId } from '../common/constants/staking-providers'
import { stakingOptions } from '../common/constants/staking-options'
import { sumBy } from 'lodash'

@Injectable()
export class StakingService {
  constructor (
    private readonly web3ProviderService: Web3ProviderService,
    private readonly voltBarService: VoltBarService
  ) { }

  get web3Provider () {
    return this.web3ProviderService.getProvider()
  }

  async stakingOptions () {
    const stakingOptions: Array<StakingOption> = []

    for (const stakingOption of stakingOptions) {
      const stakingProvider = this.getStakingProvider(stakingOption)
      const stakingApr = await stakingProvider.stakingApr()

      stakingOptions.push({
        ...stakingOption,
        stakingApr
      })
    }

    return stakingOptions
  }

  async stake (stakeDto: StakeDto) {
    const stakingOption = this.getStakingOption(stakeDto.tokenAddress)
    const stakingProvider = this.getStakingProvider(stakingOption)

    return {
      contractAddress: stakingProvider.address,
      encodedABI: stakingProvider.stake(stakeDto)
    }
  }

  async unStake (unStakeDto: UnstakeDto) {
    const stakingOption = this.getStakingOption(unStakeDto.tokenAddress)
    const stakingProvider = this.getStakingProvider(stakingOption)

    return {
      contractAddress: stakingProvider.address,
      encodedABI: stakingProvider.unStake(unStakeDto)
    }
  }

  async stakedTokens (accountAddress: string) {
    const stakedTokens = []

    for (const stakingOption of stakingOptions) {
      const stakingProvider = this.getStakingProvider(stakingOption)
      const stakedToken = await stakingProvider.stakedToken(accountAddress, stakingOption)

      if (stakedToken.stakedAmount > 0) stakedTokens.push(stakedToken)
    }

    return {
      totalStakedAmountUSD: sumBy(stakedTokens, 'stakedAmountUSD'),
      totalEarnedAmountUSD: sumBy(stakedTokens, 'earnedAmountUSD'),
      stakedTokens
    }
  }

  private getStakingOption (tokenAddress: string) {
    return stakingOptions.find(stakingOption => stakingOption.tokenAddress === tokenAddress)
  }

  private getStakingProvider (stakingOption: StakingOption): StakingProvider {
    if (stakingOption.stakingProviderId === voltBarId) {
      return this.voltBarService
    }
  }
}
