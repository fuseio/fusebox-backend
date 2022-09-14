import { Optional } from '@nestjs/common'
import { IsEthereumAddress, IsOptional, IsString } from 'class-validator'

export class ContractAddressDto {
    @IsEthereumAddress()
      address: string

    @IsOptional()
    @IsString()
      page: string

    @IsOptional()
    @IsString()
      offset: string
}
