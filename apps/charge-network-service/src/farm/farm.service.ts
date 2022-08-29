import { Injectable } from '@nestjs/common'
import Web3ProviderService from '@app/common/services/web3-provider.service'
import { ConfigService } from '@nestjs/config'
import MasterChefABI from '@app/network-service/common/constants/abi/MasterChef.json'
import { WithdrawDto } from '@app/network-service/farm/dto/withdraw.dto'
import { DepositDto } from '@app/network-service/farm/dto/deposit.dto'
import { StakerInfoDto } from '@app/network-service/farm/dto/staker_info.dto'
import { WithdrawRewardDto } from '@app/network-service/farm/dto/withdraw_reward.dto'

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
    const contractAddress = this.configService.get('masterChefVoltV3Address')
    const masterChefContract = new this.web3Provider.eth.Contract(MasterChefABI as any, contractAddress)
    const encodeABI = await masterChefContract.methods.withdraw(withdrawDto.pid, withdrawDto.amount).encodeABI()

    return {
      contractAddress,
      encodeABI
    }
  }

  async deposit (depositDto: DepositDto) {
    const contractAddress = this.configService.get('masterChefVoltV3Address')
    const masterChefContract = new this.web3Provider.eth.Contract(MasterChefABI as any, contractAddress)
    const encodeABI = await masterChefContract.methods.deposit(depositDto.pid, depositDto.amount).encodeABI()

    return {
      contractAddress,
      encodeABI
    }
  }

  async withdrawReward (withdrawRewardDto: WithdrawRewardDto) {
    const contractAddress = this.configService.get('masterChefVoltV3Address')
    const masterChefContract = new this.web3Provider.eth.Contract(MasterChefABI as any, contractAddress)
    const encodeABI = await masterChefContract.methods.deposit(withdrawRewardDto.pid, 0).encodeABI()

    return {
      contractAddress,
      encodeABI
    }
  }

  async getStakerInfo (stakerInfoDto: StakerInfoDto) {
    const contractAddress = this.configService.get('masterChefVoltV3Address')
    const masterChefContract = new this.web3Provider.eth.Contract(MasterChefABI as any, contractAddress)
    const stakerInfo = await masterChefContract.methods.userInfo(stakerInfoDto.pid, stakerInfoDto.accountAddress).call()

    return {
      stakerInfo
    }
  }
}
