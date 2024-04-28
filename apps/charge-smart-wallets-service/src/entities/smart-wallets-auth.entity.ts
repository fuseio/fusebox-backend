import { ApiProperty } from '@nestjs/swagger'

export class SmartWalletsAuth {
  @ApiProperty({ description: 'The hash of the message.', required: true, example: '0x1234567890abcdef' })
    hash: string

  @ApiProperty({ description: 'The signature of the message.', required: true, example: '0x1234567890abcdef' })
    signature: string

  @ApiProperty({ description: 'The owner address.', required: true, example: '0x1234567890abcdef' })
    ownerAddress: string

  @ApiProperty({ description: 'The smart wallet address.', required: false, example: '0x1234567890abcdef' })
    smartWalletAddress: string
}
