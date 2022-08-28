import { IsNumber, IsString, IsEthereumAddress } from 'class-validator'

export class WithdrawDto {
  @IsString()
    amount: string

  @IsEthereumAddress()
    address: string

  @IsNumber()
    pid: number
}
