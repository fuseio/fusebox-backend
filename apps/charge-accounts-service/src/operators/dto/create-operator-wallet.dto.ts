import { IsString, IsEthereumAddress, IsBoolean, IsOptional } from 'class-validator'

export class CreateOperatorWalletDto {
  @IsString()
    ownerId: string

  @IsEthereumAddress()
    smartWalletAddress: string

  @IsOptional()
  @IsBoolean()
    isActivated: boolean

  constructor (ownerId: string, smartWalletAddress: string) {
    this.ownerId = ownerId
    this.smartWalletAddress = smartWalletAddress
  }
}
