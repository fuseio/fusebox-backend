import { IsEthereumAddress, IsMongoId, IsOptional, IsString } from 'class-validator'

export class SmartAccountsAuthDto {
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
