import { IsString, IsEthereumAddress, IsOptional, IsBoolean } from 'class-validator'

export class AllTransactionsDto {
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
}
