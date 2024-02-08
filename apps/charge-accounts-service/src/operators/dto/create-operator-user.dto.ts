import { IsEmail, IsString } from 'class-validator'

export class CreateOperatorUserDto {
  @IsString()
    firstName: string

  @IsString()
    lastName: string

  @IsEmail()
    email: string
}
