import { IsEthereumAddress } from 'class-validator'

export class DelegatedAmountDto {
  @IsEthereumAddress() validatorAddress: string

  @IsEthereumAddress() delegatorAddress: string
}
