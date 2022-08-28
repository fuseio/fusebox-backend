import { IsNumber, IsString, IsEthereumAddress } from 'class-validator'

export class DepositDto {
  @IsString()
    amount: string

  @IsEthereumAddress()
    address: string

  @IsNumber()
    pid: number
}
