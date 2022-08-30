import { Controller } from '@nestjs/common'
import { MessagePattern } from '@nestjs/microservices'
import { DepositDto } from '@app/network-service/farm/dto/deposit.dto'
import { StakerInfoDto } from '@app/network-service/farm/dto/staker_info.dto'
import { WithdrawDto } from '@app/network-service/farm/dto/withdraw.dto'
import { WithdrawRewardDto } from '@app/network-service/farm/dto/withdraw_reward.dto'
import { FarmService } from '@app/network-service/farm/farm.service'

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

  @MessagePattern('get_staker_info')
  getStakerInfo (stakerInfoDto: StakerInfoDto) {
    return this.farmService.getStakerInfo(stakerInfoDto)
  }
}
