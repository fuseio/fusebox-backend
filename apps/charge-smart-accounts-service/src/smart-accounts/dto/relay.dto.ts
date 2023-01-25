import { IsEthereumAddress, IsInt, IsMongoId, IsObject, IsOptional, IsString } from 'class-validator'

export class RelayDto {
  @IsOptional()
  @IsMongoId()
    projectId: string

  @IsEthereumAddress()
    walletAddress: string

  @IsString()
    methodData: string

  @IsString()
    nonce: string

  @IsString()
    methodName: string

  @IsString()
    signature: string

  @IsString()
    walletModule: string

  @IsString()
    externalId: string

  @IsOptional()
  @IsObject()
    transactionBody: string

  @IsOptional()
  @IsInt()
    gasPrice: string

  @IsOptional()
  @IsInt()
    gasLimit: string

  @IsOptional()
  @IsString()
    network: string
}
