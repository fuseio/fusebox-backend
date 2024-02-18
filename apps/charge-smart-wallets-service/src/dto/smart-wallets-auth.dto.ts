import { IsEthereumAddress, IsOptional, IsString } from 'class-validator'

export class SmartWalletsAuthDto {
  @IsString()
    hash: string

  @IsString()
    signature: string

  @IsEthereumAddress()
    ownerAddress: string

  @IsOptional()
  @IsEthereumAddress()
    smartWalletAddress: string

  @IsOptional()
  @IsString()
    apiKey: string
}
