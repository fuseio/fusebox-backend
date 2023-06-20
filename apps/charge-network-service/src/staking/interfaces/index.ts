import { StakeDto } from '@app/network-service/staking/dto/stake.dto'
import { UnstakeDto } from '@app/network-service/staking/dto/unstake.dto'

interface Token {
    tokenAddress: string
    tokenSymbol: string
    tokenName: string
    tokenLogoURI: string
    unStakeTokenAddress: string
}

export interface StakingOption extends Token {
    stakingProviderId: string
    stakingApr?: number
    tvl?: number
}

export interface StakedToken extends Token {
    stakedAmount: number
    stakedAmountUSD: number
    earnedAmountUSD: number
}

export interface UserStakedTokens {
    totalStakedAmountUSD: string
    totalEarnedAmountUSD: string
    stakedTokens: Array<StakedToken>
}

export interface StakingProvider {
    address: string
    stake: (stakeDto: StakeDto) => string
    unStake: (unStakeDto: UnstakeDto) => string
    stakedToken: (accountAddress: string, stakingOption: StakingOption) => Promise<StakedToken>
    stakingApr: (stakingOption: StakingOption) => Promise<number>
    tvl: (stakingOption: StakingOption) => Promise<number>
}
