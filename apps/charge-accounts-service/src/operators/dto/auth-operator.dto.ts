import { IsEthereumAddress, IsString } from 'class-validator'

export class AuthOperatorDto {
  @IsEthereumAddress()
    externallyOwnedAccountAddress: string

  @IsString()
    message: string

  @IsString()
    signature: string
}
