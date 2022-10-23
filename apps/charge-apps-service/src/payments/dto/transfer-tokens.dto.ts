import { IsEthereumAddress, IsOptional, IsString } from 'class-validator'

export class TransferTokensDto {
  @IsOptional()
  @IsString()
    ownerId: string
  
  @IsEthereumAddress()
    tokenAddress: string
  
  @IsOptional()
  @IsEthereumAddress()
    from: string

  @IsEthereumAddress()
    to: string

  @IsString()
    amount: string
}
