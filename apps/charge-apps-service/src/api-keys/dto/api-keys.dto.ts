import { IsString } from 'class-validator'

export class ApiKeysDto {
  @IsString()
    ownerId: string

  @IsString()
    appName: string
}
