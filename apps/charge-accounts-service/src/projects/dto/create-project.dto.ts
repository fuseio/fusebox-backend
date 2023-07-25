import { IsString } from 'class-validator'
export class CreateProjectDto {
  @IsString()
    ownerId: string

  @IsString()
    name: string

  @IsString()
    description: string
}
