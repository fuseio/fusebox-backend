import { IsEthereumAddress, IsMongoId, IsOptional, IsString } from 'class-validator'

export class SmartWalletsAuthDto {
  @IsString()
    hash: string

  @IsString()
    signature: string

  @IsEthereumAddress()
    ownerAddress: string

  @IsOptional()
  @IsMongoId()
    projectId
}
