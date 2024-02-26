import { IsString, IsEthereumAddress, IsBoolean, IsOptional } from 'class-validator'

export class CreateOperatorWalletDto {
  @IsString()
    ownerId: string

  @IsEthereumAddress()
    smartWalletAddress: string

  @IsOptional()
  @IsBoolean()
    isActivated: boolean
}
