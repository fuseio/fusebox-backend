import { IsNumber } from 'class-validator'

export class WithdrawRewardDto {
  @IsNumber()
    pid: number
}
