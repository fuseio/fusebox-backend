import { IsEmail, IsEthereumAddress, IsString } from 'class-validator'

export class CreateOperatorDto {
  @IsString()
    firstName: string

  @IsString()
    lastName: string

  @IsEmail()
    emailAddress: string

  @IsEthereumAddress()
    externallyOwnedAccountAddress: string

  @IsEthereumAddress()
    smartContractAccountAddress: string
}
