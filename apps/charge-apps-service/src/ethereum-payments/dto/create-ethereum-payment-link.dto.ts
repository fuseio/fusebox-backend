import { IsEthereumAddress, IsNumber, IsOptional, IsString, IsUrl } from 'class-validator'

export class CreateEthereumPaymentLinkDto {
  @IsString()
  @IsOptional()
    ownerId: string

  @IsString()
    title: string

  @IsString()
    description: string

  @IsNumber()
    amount: string

  @IsEthereumAddress()
    tokenAddress: string

  @IsString()
    tokenSymbol: string

  @IsString()
  @IsOptional()
    backendWalletId: string

  @IsUrl()
  @IsOptional()
    webhookUrl: string
}
