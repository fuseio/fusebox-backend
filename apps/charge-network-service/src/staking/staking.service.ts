import { Injectable } from '@nestjs/common'
import Web3ProviderService from '@app/common/services/web3-provider.service'
import { UnstakeDto } from '@app/network-service/staking/dto/unstake.dto'
import { StakeDto } from '@app/network-service/staking/dto/stake.dto'
import {
  StakingOption,
  StakingProvider
} from '@app/network-service/staking/interfaces'
import VoltBarService from '@app/network-service/staking/staking-providers/volt-bar.service'
import { sumBy } from 'lodash'
import {
  fuseLiquidStakingId,
  usdcOnStargateSimpleStakingId,
  voltBarId,
  wethOnStargateSimpleStakingId
} from '@app/network-service/common/constants'
import { ConfigService } from '@nestjs/config'
import FuseLiquidStakingService from '@app/network-service/staking/staking-providers/fuse-liquid-staking.service'
import SimpleStakingService from '@app/network-service/staking/staking-providers/simple-staking.service'

@Injectable()
export class StakingService {
  constructor (
    private readonly web3ProviderService: Web3ProviderService,
    private readonly voltBarService: VoltBarService,
    private readonly fuseLiquidStakingService: FuseLiquidStakingService,
    private readonly simpleStakingService: SimpleStakingService,
    private readonly configService: ConfigService
  ) {}

  get web3Provider () {
    return this.web3ProviderService.getProvider()
  }

  get stakingOptionsConfig () {
    return this.configService.get('stakingOptions') as Array<StakingOption>
  }

  get stakingOptionsV2Config () {
    return this.configService.get('stakingOptionsV2') as Array<StakingOption>
  }

  async stakingOptions () {
    const stakingOptionsData: Array<StakingOption> = []

    for (const stakingOption of this.stakingOptionsConfig) {
      const stakingProvider = this.getStakingProvider(stakingOption)
      const stakingApr = await stakingProvider.stakingApr(stakingOption)
      const tvl = await stakingProvider.tvl(stakingOption)

      stakingOptionsData.push({
        ...stakingOption,
        stakingApr,
        tvl
      })
    }

    return stakingOptionsData
  }

  async stakingOptionsV2 () {
    const stakingOptionsData: Array<StakingOption> = []

    for (const stakingOption of this.stakingOptionsV2Config) {
      const stakingProvider = this.getStakingProvider(stakingOption)
      const stakingApr = await stakingProvider.stakingApr(stakingOption)
      const tvl = await stakingProvider.tvl(stakingOption)

      stakingOptionsData.push({
        ...stakingOption,
        stakingApr,
        tvl
      })
    }

    return stakingOptionsData
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

    for (const stakingOption of this.stakingOptionsConfig) {
      const stakingProvider = this.getStakingProvider(stakingOption)
      const stakedToken = await stakingProvider.stakedToken(accountAddress, stakingOption)

      if (stakedToken.stakedAmount > 0) {
        stakedTokens.push(stakedToken)
      }
    }

    return {
      totalStakedAmountUSD: sumBy(stakedTokens, 'stakedAmountUSD'),
      totalEarnedAmountUSD: sumBy(stakedTokens, 'earnedAmountUSD'),
      stakedTokens
    }
  }

  private getStakingOption (tokenAddress: string) {
    return this.stakingOptionsConfig.find(
      (stakingOption) => stakingOption.tokenAddress === tokenAddress
    )
  }

  private getStakingProvider (stakingOption: StakingOption): StakingProvider {
    const stakingProviderId = stakingOption.stakingProviderId

    const isSimpleStaking =
      stakingProviderId === usdcOnStargateSimpleStakingId ||
      stakingProviderId === wethOnStargateSimpleStakingId

    if (stakingProviderId === voltBarId) {
      return this.voltBarService
    } else if (stakingProviderId === fuseLiquidStakingId) {
      return this.fuseLiquidStakingService
    } else if (isSimpleStaking) {
      return this.simpleStakingService
    }
  }
}
