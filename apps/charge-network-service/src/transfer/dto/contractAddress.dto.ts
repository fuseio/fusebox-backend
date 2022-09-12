import { Optional } from '@nestjs/common'
import { IsEthereumAddress, IsOptional, IsString } from 'class-validator'

export class AddressDto {
    @IsEthereumAddress()
      address: string

    @Optional()
    @IsString()
      page: string

    @Optional()
    @IsString()
      offset: string
}
