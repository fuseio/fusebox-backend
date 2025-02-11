import { IsEthereumAddress, IsString } from 'class-validator'

export class WithdrawAmountsDto {
  @IsEthereumAddress()
    validator: string

  @IsString()
    amount: string
}
