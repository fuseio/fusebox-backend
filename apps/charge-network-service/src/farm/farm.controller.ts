import { Controller } from '@nestjs/common'
import { MessagePattern } from '@nestjs/microservices'
import { DepositDto } from './dto/deposit.dto'
import { StakerInfoDto } from './dto/staker_info.dto'
import { WithdrawDto } from './dto/withdraw.dto'
import { WithdrawRewardDto } from './dto/withdraw_reward.dto'
import { FarmService } from './farm.service'

@Controller('farm')
export class FarmController {
  constructor (private readonly farmService: FarmService) { }

  @MessagePattern('deposit')
  deposit (depositDto: DepositDto) {
    return this.farmService.deposit(depositDto)
  }

  @MessagePattern('withdraw')
  withdraw (withdrawDto: WithdrawDto) {
    return this.farmService.deposit(withdrawDto)
  }

  @MessagePattern('withdraw_reward')
  withdrawReward (withdrawRewardDto: WithdrawRewardDto) {
    return this.farmService.withdrawReward(withdrawRewardDto)
  }

  @MessagePattern('user_info')
  getStakerInfo (stakerInfoDto: StakerInfoDto) {
    return this.farmService.getStakerInfo(stakerInfoDto)
  }
}
