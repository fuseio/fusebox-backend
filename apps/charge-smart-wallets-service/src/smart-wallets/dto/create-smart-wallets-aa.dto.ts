import { IsString, IsEthereumAddress, IsBoolean, IsOptional } from 'class-validator'

export class CreateSmartWalletsAADto {
  @IsString()
    ownerId: string

  @IsEthereumAddress()
    smartWalletAddress: string

  @IsOptional()
  @IsBoolean()
    isPaymasterFunded: boolean
}
