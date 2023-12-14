import { IsEmail, IsString } from 'class-validator'

export class CreateOperatorDto {
  @IsString()
    firstName: string

  @IsString()
    lastName: string

  @IsEmail()
    email: string
}
