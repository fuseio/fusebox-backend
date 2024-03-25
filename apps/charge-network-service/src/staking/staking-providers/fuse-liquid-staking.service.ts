import LiquidStakingABI from '@app/network-service/common/constants/abi/FuseLiquidStaking.json'
import Erc20ABI from '@app/network-service/common/constants/abi/Erc20.json'
import ConsensusABI from '@app/network-service/common/constants/abi/Consensus.json'
import BlockRewardABI from '@app/network-service/common/constants/abi/BlockReward.json'
import TradeService from '@app/common/services/trade.service'
import Web3ProviderService from '@app/common/services/web3-provider.service'
import { aprToApy, encodeFunctionCall } from '@app/network-service/common/utils/helper-functions'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { UnstakeDto } from '@app/network-service/staking/dto/unstake.dto'
import { StakingOption, StakingProvider } from '@app/network-service/staking/interfaces'
import { formatEther } from 'ethers'

@Injectable()
export default class FuseLiquidStakingService implements StakingProvider {
  constructor (
        private readonly web3ProviderService: Web3ProviderService,
        private readonly configService: ConfigService,
        private readonly tradeService: TradeService
  ) {}

  get address () {
    return this.configService.get('fuseLiquidStakingAddress')
  }

  get sfTokenAddress () {
    return this.configService.get('sfTokenAddress')
  }

  get consensusAddress () {
    return this.configService.get('consensusAddress')
  }

  get blockRewardAddress () {
    return this.configService.get('blockRewardAddress')
  }

  get wfuseAddress () {
    return this.configService.get('wfuseAddress')
  }

  get validatorFee () {
    return this.configService.get('validatorFee')
  }

  get web3Provider () {
    return this.web3ProviderService.getProvider()
  }

  stake () {
    return encodeFunctionCall(
      LiquidStakingABI,
      this.web3Provider,
      'deposit',
      []
    )
  }

  unStake ({ tokenAmount }: UnstakeDto) {
    return encodeFunctionCall(
      LiquidStakingABI,
      this.web3Provider,
      'withdraw',
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
    const liquidStakingContract = new this.web3Provider.eth.Contract(LiquidStakingABI as any, this.address)
    const sfContract = new this.web3Provider.eth.Contract(Erc20ABI as any, this.sfTokenAddress)

    const priceRatio = await liquidStakingContract.methods.priceRatio().call()
    const sfBalance = await sfContract.methods.balanceOf(accountAddress).call()

    const stakedAmount = Number(formatEther(sfBalance)) * Number(formatEther(priceRatio))
    const fusePrice = await this.tradeService.getTokenPrice(this.wfuseAddress)
    const stakedAmountUSD = stakedAmount * fusePrice
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
  }

  async stakingApr () {
    const consensusContract = new this.web3Provider.eth.Contract(ConsensusABI as any, this.consensusAddress)
    const blockRewardContract = new this.web3Provider.eth.Contract(BlockRewardABI as any, this.blockRewardAddress)
    const validatorFee = Number(this.validatorFee)

    const totalStakeAmount = await consensusContract.methods.totalStakeAmount().call()
    const rewardPerBlock = await blockRewardContract.methods.getBlockRewardAmount().call()
    const blocksPerYear = await blockRewardContract.methods.getBlocksPerYear().call()

    const rewardPerYearApr = (Number(formatEther(rewardPerBlock)) * blocksPerYear * (1 - validatorFee) / Number(formatEther(totalStakeAmount))) * 100

    return aprToApy(rewardPerYearApr, 365)
  }

  async tvl () {
    const liquidStakingContract = new this.web3Provider.eth.Contract(LiquidStakingABI as any, this.address)

    const totalStaked = await liquidStakingContract.methods.systemTotalStaked().call()

    const fusePrice = await this.tradeService.getTokenPrice(this.wfuseAddress)

    return Number(formatEther(totalStaked)) * fusePrice
  }
}
