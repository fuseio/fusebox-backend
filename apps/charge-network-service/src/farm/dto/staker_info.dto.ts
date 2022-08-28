import { IsNumber, IsEthereumAddress } from 'class-validator'

export class StakerInfoDto {
  @IsEthereumAddress()
    account: string

  @IsNumber()
    pid: number
}
