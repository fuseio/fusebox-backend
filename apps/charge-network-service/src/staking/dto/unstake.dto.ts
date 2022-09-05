import { IsNumber, IsEthereumAddress } from 'class-validator'

export class UnstakeDto {
  @IsEthereumAddress()
    accountAddress: string

  @IsNumber()
    tokenAmount: string

  @IsEthereumAddress()
    tokenAddress: string
}
