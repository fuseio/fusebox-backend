import { IsEthereumAddress, IsInt, IsObject, IsOptional, IsString } from 'class-validator'

export class RelayDto {
  @IsOptional()
  @IsEthereumAddress()
    ownerAddress: string

  @IsEthereumAddress()
    walletAddress: string

  @IsString()
    data: string

  @IsString()
    nonce: string

  @IsString()
    methodName: string

  @IsString()
    signature: string

  @IsString()
    walletModule: string

  @IsOptional()
  @IsString()
    externalId: string

  @IsOptional()
  @IsObject()
    transactionBody: object

  @IsOptional()
  @IsInt()
    gasPrice: number

  @IsOptional()
  @IsInt()
    gasLimit: number

  @IsOptional()
  @IsString()
    network: string
}
