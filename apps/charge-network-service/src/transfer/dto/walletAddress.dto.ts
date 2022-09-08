import { IsEthereumAddress, IsOptional } from 'class-validator'

export class AddressDto {
    @IsEthereumAddress()
      address: string
}
