import { IsNumber, IsEthereumAddress } from 'class-validator'

export class StakerInfoDto {
  @IsEthereumAddress()
    accountAddress: string

  @IsNumber()
    pid: number
}
