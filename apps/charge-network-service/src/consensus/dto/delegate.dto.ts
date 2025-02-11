import { IsEthereumAddress } from 'class-validator'

export class DelegatedAmountsDto {
  @IsEthereumAddress()
    validator: string

  @IsEthereumAddress({ each: true })
    delegators: string[]
}
