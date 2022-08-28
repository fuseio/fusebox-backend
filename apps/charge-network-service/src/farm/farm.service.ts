import { Injectable } from '@nestjs/common'
import Web3ProviderService from '@app/common/services/web3-provider.service'
import { ConfigService } from '@nestjs/config'
import ConsensusABI from '../common/constants/abi/Consensus.json'
import MasterChefABI from '../common/constants/abi/MasterChef.json'
import BlockRewardABI from '../common/constants/abi/BlockReward.json'
import { formatEther, parseUnits } from 'nestjs-ethers'
import { WithdrawDto } from './dto/withdraw.dto'
import { DepositDto } from './dto/deposit.dto'

const BLOCKS_IN_YEAR = 6307200

@Injectable()
export class FarmService {
  constructor (
    private readonly web3ProviderService: Web3ProviderService,
    private configService: ConfigService
  ) { }

  get web3Provider () {
    return this.web3ProviderService.getProvider()
  }

  async getBlockRewardAmount () {
    const blockRewardContract = new this.web3Provider.eth.Contract(BlockRewardABI as any, this.configService.get('blockRewardAddress'))
    const rewardPerBlock = await blockRewardContract.methods.getBlockRewardAmount().call()

    return rewardPerBlock
  }

  async validatorFee (validator: string) {
    const consensusContract = new this.web3Provider.eth.Contract(ConsensusABI as any, this.configService.get('consensusAddress'))
    const fee = await consensusContract.methods.validatorFee(validator).call()

    return fee
  }

  async getEstimatedAPR () {
    const rewardPerBlock = await this.getBlockRewardAmount()
    const { totalStakeAmount } = await this.getTotalStakeAmount()
    const numberOfValidators = (await this.getValidators()).validators.length
    const amount = parseUnits('1')
    const fee = formatEther((await this.validatorFee(this.configService.get('defaultValidator'))))

    const rewardPerYourBlocks = this.calcRewardPerYourBlocks(
      rewardPerBlock,
      amount,
      numberOfValidators,
      totalStakeAmount,
      parseUnits((1 - parseFloat(fee)).toString())
    )

    const average = rewardPerYourBlocks.div(numberOfValidators)
    const rewardPerYear = average.mul(BLOCKS_IN_YEAR)
    const estimatedAPR = rewardPerYear.div(amount)
    return {
      estimatedAPR: formatEther(estimatedAPR)
    }
  }

  async getValidators () {
    const consensusContract = new this.web3Provider.eth.Contract(ConsensusABI as any, this.configService.get('consensusAddress'))
    const validators = await consensusContract.methods.getValidators().call()

    return {
      validators
    }
  }

  async getTotalStakeAmount () {
    const consensusContract = new this.web3Provider.eth.Contract(ConsensusABI as any, this.configService.get('consensusAddress'))
    const totalStakeAmount = await consensusContract.methods.totalStakeAmount().call()

    return {
      totalStakeAmount
    }
  }

  async withdraw (withdrawDto: WithdrawDto) {
    const masterChefContract = new this.web3Provider.eth.Contract(MasterChefABI as any, this.configService.get('masterChefVoltV3Address'))
    const data = await masterChefContract.methods.withdraw(withdrawDto.pid, withdrawDto.amount).encodeABI()
    const transactionObject = {
      to: this.configService.get('consensusAddress'),
      value: withdrawDto.amount,
      data
    }

    return {
      transactionObject
    }
  }

  async deposit (depositDto: DepositDto) {
    const masterChefContract = new this.web3Provider.eth.Contract(MasterChefABI as any, this.configService.get('masterChefVoltV3Address'))
    const data = await masterChefContract.methods.deposit(depositDto.pid, depositDto.amount).encodeABI()
    const transactionObject = {
      to: this.configService.get('consensusAddress'),
      value: depositDto.amount,
      data
    }

    return {
      transactionObject
    }
  }

  async withdrawReward (depositDto: DepositDto) {
    const masterChefContract = new this.web3Provider.eth.Contract(MasterChefABI as any, this.configService.get('masterChefVoltV3Address'))
    const data = await masterChefContract.methods.deposit(depositDto.pid, 0).encodeABI()
    const transactionObject = {
      to: this.configService.get('consensusAddress'),
      value: depositDto.amount,
      data
    }

    return {
      transactionObject
    }
  }

  // async getDelegatedAmount (delegatedAmountDto: DelegatedAmountDto) {
  //   const consensusContract = new this.web3Provider.eth.Contract(ConsensusABI as any, this.configService.get('consensusAddress'))
  //   const delegatedAmount = await consensusContract.methods.delegatedAmount(delegatedAmountDto.delegatorAddress, delegatedAmountDto.validatorAddress).call()

  //   return {
  //     delegatedAmount
  //   }
  // }
}
