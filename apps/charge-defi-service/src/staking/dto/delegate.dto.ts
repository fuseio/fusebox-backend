import { IsEthereumAddress, IsString } from 'class-validator'

export class DelegateDto {
  @IsEthereumAddress() validatorAddress: string

  @IsString()amount: string
}
