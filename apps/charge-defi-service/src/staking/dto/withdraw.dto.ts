import { IsEthereumAddress, IsString } from 'class-validator'

export class WithdrawDto {
  @IsEthereumAddress()
    validatorAddress: string

  @IsString()
    amount: string
}
