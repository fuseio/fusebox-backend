import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { IsValidPublicApiKeyGuard } from '@app/api-service/api-keys/guards/is-valid-public-api-key.guard'
import { FarmAPIService } from '@app/api-service/farm-api/farm-api.service'
import { WithdrawDto } from '@app/network-service/farm/dto/withdraw.dto'
import { DepositDto } from '@app/network-service/farm/dto/deposit.dto'
import { StakerInfoDto } from '@app/network-service/farm/dto/staker_info.dto'
import { WithdrawRewardDto } from '@app/network-service/farm/dto/withdraw_reward.dto'

@UseGuards(IsValidPublicApiKeyGuard)
@Controller('v0/farm')
export class FarmApiController {
  constructor (private readonly farmAPIService: FarmAPIService) { }

  @Post('withdraw')
  withdraw (@Body() withdrawDto: WithdrawDto) {
    return this.farmAPIService.withdraw(withdrawDto)
  }

  @Post('deposit')
  async deposit (@Body() depositDto: DepositDto) {
    return this.farmAPIService.deposit(depositDto)
  }

  @Post('withdraw_reward')
  withdrawReward (@Body() withdrawRewardDto: WithdrawRewardDto) {
    return this.farmAPIService.withdrawReward(withdrawRewardDto)
  }

  @Post('user_info')
  getStakerInfo (@Body() stakerInfoDto: StakerInfoDto) {
    return this.farmAPIService.getStakerInfo(stakerInfoDto)
  }
}
