import { IsString } from 'class-validator'

export class CreateChargeBridgeDto {
  @IsString()
    chainId: string

  @IsString()
    amount: string
}
