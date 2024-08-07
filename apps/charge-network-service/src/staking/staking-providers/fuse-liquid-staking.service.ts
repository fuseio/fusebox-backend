import LiquidStakingABI from '@app/network-service/common/constants/abi/FuseLiquidStaking.json'
import Erc20ABI from '@app/network-service/common/constants/abi/Erc20.json'
import ConsensusABI from '@app/network-service/common/constants/abi/Consensus'
import BlockRewardABI from '@app/network-service/common/constants/abi/BlockReward.json'
import TradeService from '@app/common/token/trade.service'
import {
  Contract,
  InjectEthersProvider,
  Interface,
  JsonRpcProvider,
  formatEther,
  parseEther
} from 'nestjs-ethers'
import { aprToApy } from '@app/network-service/common/utils/helper-functions'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { UnstakeDto } from '@app/network-service/staking/dto/unstake.dto'
import { StakingOption, StakingProvider } from '@app/network-service/staking/interfaces'

@Injectable()
export default class FuseLiquidStakingService implements StakingProvider {
  private readonly logger = new Logger(FuseLiquidStakingService.name)

  constructor (
    @InjectEthersProvider('regular-node')
    private readonly provider: JsonRpcProvider,
    private readonly configService: ConfigService,
    private readonly tradeService: TradeService
  ) { }

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

  get liquidStakingInterface () {
    return new Interface(LiquidStakingABI)
  }

  stake () {
    return this.liquidStakingInterface.encodeFunctionData('deposit', [])
  }

  unStake ({ tokenAmount }: UnstakeDto) {
    return this.liquidStakingInterface.encodeFunctionData('withdraw', [parseEther(tokenAmount)])
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
    const liquidStakingContract = new Contract(this.address, LiquidStakingABI, this.provider)
    const sfContract = new Contract(this.sfTokenAddress, Erc20ABI, this.provider)

    const priceRatio = await liquidStakingContract.priceRatio()
    const sfBalance = await sfContract.balanceOf(accountAddress)

    const stakedAmount = Number(formatEther(sfBalance.toString())) * Number(formatEther(priceRatio.toString()))
    const fusePrice = await this.tradeService.getTokenPriceByAddress(this.wfuseAddress)
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
    try {
      const consensusContract = new Contract(this.consensusAddress, ConsensusABI, this.provider)
      const blockRewardContract = new Contract(this.blockRewardAddress, BlockRewardABI, this.provider)
      const validatorFee = Number(this.validatorFee)
      const totalStakeAmount: BigInt = await consensusContract.totalStakeAmount()
      const rewardPerBlock: BigInt = await blockRewardContract.getBlockRewardAmount()
      const blocksPerYear: BigInt = await blockRewardContract.getBlocksPerYear()

      const rewardPerYearApr = (Number(formatEther(rewardPerBlock.toString())) * Number(blocksPerYear) * (1 - validatorFee) / Number(formatEther(totalStakeAmount.toString()))) * 100

      return aprToApy(rewardPerYearApr, 365)
    } catch (error) {
      this.logger.error(`stakingApr error: ${error}`)
    }
  }

  async tvl () {
    try {
      const liquidStakingContract = new Contract(this.address, LiquidStakingABI, this.provider)
      const totalStaked = await liquidStakingContract.systemTotalStaked()
      const fusePrice = await this.tradeService.getTokenPriceByAddress(this.wfuseAddress)

      return Number(formatEther(totalStaked.toString())) * fusePrice
    } catch (error) {
      this.logger.error(`tvl error: ${error}`)
    }
  }
}
