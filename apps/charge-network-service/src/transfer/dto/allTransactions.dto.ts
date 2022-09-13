import { IsString, IsEthereumAddress, IsOptional, IsBoolean } from 'class-validator'

export class allTransactionsDto {
    @IsEthereumAddress()
      address: string

    @IsOptional()
    @IsString()
      sort: string

    @IsOptional()
    @IsString()
      startblock: string

    @IsOptional()
    @IsString()
      endblock: string

    @IsOptional()
    @IsString()
      page: string

    @IsOptional()
    @IsString()
      offset: string

    @IsOptional()
    @IsString()
      filterby: string

    @IsOptional()
    @IsString()
      starttimestamp: string

    @IsOptional()
    @IsString()
      endttimestamp: string
}
