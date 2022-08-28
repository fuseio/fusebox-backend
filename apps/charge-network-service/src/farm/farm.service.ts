import { Injectable } from '@nestjs/common'
import Web3ProviderService from '@app/common/services/web3-provider.service'
import { ConfigService } from '@nestjs/config'
import MasterChefABI from '../common/constants/abi/MasterChef.json'
import { WithdrawDto } from './dto/withdraw.dto'
import { DepositDto } from './dto/deposit.dto'

@Injectable()
export class FarmService {
  constructor (
    private readonly web3ProviderService: Web3ProviderService,
    private configService: ConfigService
  ) { }

  get web3Provider () {
    return this.web3ProviderService.getProvider()
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
}
