import { IsEthereumAddress, IsOptional } from 'class-validator'

export class WalletAddressDto {
  @IsEthereumAddress()
    address: string
}
