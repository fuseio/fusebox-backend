import { IsEthereumAddress, IsNumber, IsOptional, IsString } from 'class-validator'

export class CreatePaymentLinkDto {
  @IsString()
  @IsOptional()
    ownerId: string
  
  @IsString()
    title: string

  @IsString()
    description: string

  @IsString()
    amount: string

  @IsEthereumAddress()
    tokenAddress: string

  @IsString()
    tokenSymbol: string

  @IsString()
  @IsOptional()
    backendWalletId: string
}
