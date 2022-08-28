import { IsNumber, IsEthereumAddress } from 'class-validator'

export class StatsDto {
  @IsEthereumAddress()
    account: string

  @IsEthereumAddress()
    pairAddress: string

  @IsNumber()
    networkId: string

  @IsNumber()
    pid: number
}
