import { ApiProperty } from '@nestjs/swagger'
import { IsEthereumAddress, IsString } from 'class-validator'

export class Stake {
  @ApiProperty({ example: '0x1234567890123456789012345678901234567890', description: 'The account address.' })
    accountAddress: string

  @ApiProperty({ example: '1000000000000000000', description: 'The amount of tokens to stake.' })
  @IsString()
    tokenAmount: string

  @ApiProperty({ example: '0x1234567890123456789012345678901234567890', description: 'The token address.' })
  @IsEthereumAddress()
    tokenAddress: string
}
