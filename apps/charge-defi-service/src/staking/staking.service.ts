import { Injectable } from '@nestjs/common'
import Web3ProviderService from '@app/common/services/web3-provider.service'
import { ConfigService } from '@nestjs/config'
import ConsensusABI from '../common/constants/abi/Consensus.json'
import BlockRewardABI from '../common/constants/abi/BlockReward.json'
import { DelegateDto } from '@app/defi-service/staking/dto/delegate.dto'
import { DelegatedAmountDto } from '@app/defi-service/staking/dto/delegated_amount.dto'
import { WithdrawDto } from '@app/defi-service/staking/dto/withdraw.dto'
import { BigNumber, formatEther, parseUnits } from 'nestjs-ethers'

const BLOCKS_IN_YEAR = 6307200

@Injectable()
export class StakingService {
  constructor (
    private readonly web3ProviderService: Web3ProviderService,
    private configService: ConfigService
  ) { }

  get web3Provider () {
    return this.web3ProviderService.getProvider()
  }

  async getBlockRewardAmount () {
    const consensusContract = new this.web3Provider.eth.Contract(BlockRewardABI as any, this.configService.get('blockRewardAddress'))
    const rewardPerBlock = await consensusContract.methods.getBlockRewardAmount().call()
    return rewardPerBlock
  }

  async getEstimatedAPR () {
    const rewardPerBlock = await this.getBlockRewardAmount()
    const totalStakeAmount = await this.getTotalStakeAmount()
    const numberOfValidators = (await this.getValidators()).length
    const amount = parseUnits('1')
    // 15% fixed fee; 1 - 0.15 =0.85;
    const fee = '850000000000000000'

    const rewardPerYourBlocks = this.calcRewardPerYourBlocks(
      rewardPerBlock,
      amount,
      numberOfValidators,
      totalStakeAmount,
      fee
    )

    const average = rewardPerYourBlocks.div(numberOfValidators)
    const rewardPerYear = average.mul(BLOCKS_IN_YEAR)
    const estimatedAPR = rewardPerYear.div(amount)
    return formatEther(estimatedAPR)
  }

  async getValidators () {
    const consensusContract = new this.web3Provider.eth.Contract(ConsensusABI as any, this.configService.get('consensusAddress'))
    const validators = await consensusContract.methods.getValidators().call()
    return validators
  }

  async getTotalStakeAmount () {
    const consensusContract = new this.web3Provider.eth.Contract(ConsensusABI as any, this.configService.get('consensusAddress'))
    const totalStakeAmount = await consensusContract.methods.totalStakeAmount().call()
    return totalStakeAmount
  }

  async withdraw (withdrawDto: WithdrawDto) {
    const consensusContract = new this.web3Provider.eth.Contract(ConsensusABI as any, this.configService.get('consensusAddress'))
    const data = await consensusContract.methods.withdraw(withdrawDto.validatorAddress, withdrawDto.amount).encodeABI()
    const transactionObject = {
      to: this.configService.get('consensusAddress'),
      value: withdrawDto.amount,
      data
    }

    return transactionObject
  }

  async delegate (delegateDto: DelegateDto) {
    const consensusContract = new this.web3Provider.eth.Contract(ConsensusABI as any, this.configService.get('consensusAddress'))
    const data = await consensusContract.methods.delegate(delegateDto.validatorAddress).encodeABI()
    const transactionObject = {
      to: this.configService.get('consensusAddress'),
      value: delegateDto.amount,
      data
    }

    return transactionObject
  }

  async getDelegatedAmount (delegatedAmountDto: DelegatedAmountDto) {
    const consensusContract = new this.web3Provider.eth.Contract(ConsensusABI as any, this.configService.get('consensusAddress'))
    const delegatedAmount = await consensusContract.methods.delegatedAmount(delegatedAmountDto.delegatorAddress, delegatedAmountDto.validatorAddress).encodeABI()

    return delegatedAmount
  }

  calcRewardPerYourBlocks (
    rewardPerBlock,
    stakeAmount,
    numberOfValidators,
    totalStakeAmount,
    fee
  ) {
    const result = BigNumber.from(rewardPerBlock)
      .mul(stakeAmount)
      .mul(BigNumber.from(numberOfValidators))
      .div(BigNumber.from(totalStakeAmount))
      .mul(BigNumber.from(fee))

    return result
  }
}
