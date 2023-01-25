import { IsEthereumAddress, IsMongoId, IsOptional, IsString } from 'class-validator'

export class SmartAccountsAuthDto {
  @IsString()
    hash: string

  @IsString()
    sig: string

  @IsEthereumAddress()
    ownerAddress: string

  @IsOptional()
  @IsMongoId()
    projectId
}
