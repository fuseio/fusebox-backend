import { IsEthereumAddress, IsOptional } from 'class-validator'

export class AddressDto {
    @IsOptional()
    @IsEthereumAddress()
    address: string
}
