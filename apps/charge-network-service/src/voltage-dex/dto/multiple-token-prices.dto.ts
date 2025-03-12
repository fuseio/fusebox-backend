import { IsEthereumAddress } from 'class-validator'

export class MultipleTokenPricesDto {
  @IsEthereumAddress({ each: true })
    tokenAddresses: string[]
}
