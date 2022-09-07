import { IsString, IsEthereumAddress, IsOptional, IsBoolean } from 'class-validator'

export class TransferDto {
    @IsString()
      fromBlock: string

    @IsString()
      toBlock: string

    @IsOptional()
    @IsEthereumAddress()
      fromAddress: string

    @IsOptional()
    @IsEthereumAddress()
      toAddress: string

    @IsString()
      tokenAddress: string

    @IsOptional()
    @IsBoolean()
      minted: boolean
}
