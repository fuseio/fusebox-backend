import { IsEmail, IsString, IsOptional } from 'class-validator'

export class CreateOperatorUserDto {
  @IsString()
    firstName: string

  @IsString()
    lastName: string

  @IsEmail()
    email: string

  @IsOptional()
  @IsString()
    name: string

  @IsOptional()
  @IsString()
    description: string
}
