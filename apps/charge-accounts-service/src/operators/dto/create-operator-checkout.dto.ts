import { IsString } from 'class-validator'

export class CreateOperatorCheckoutDto {
  @IsString()
    successUrl: string

  @IsString()
    cancelUrl: string

  @IsString()
    billingCycle: string
}
