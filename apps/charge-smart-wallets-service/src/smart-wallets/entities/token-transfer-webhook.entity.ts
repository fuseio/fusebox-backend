import { TokenType } from '@app/notifications-service/common/constants/token-types'
import { ApiProperty } from '@nestjs/swagger'

export class TokenTransferWebhook {
  @ApiProperty({ description: 'The address of the recipient.', required: true, example: '0x1234567890abcdef' })
    to: string

  @ApiProperty({ description: 'The direction of the transfer.', required: true, example: 'incoming', enum: ['incoming', 'outgoing'], enumName: 'direction', isArray: true })
    direction: string

  @ApiProperty({ description: 'The address of the sender.', required: true, example: '0x1234567890abcdef' })
    from: string

  @ApiProperty({ description: 'The transaction hash.', required: true, example: '0x1234567890abcdef' })
    txHash: string

  @ApiProperty({ description: 'The value of the transfer.', required: false, example: '1000000000000000000' })
    value?: string

  @ApiProperty({ description: 'The token ID.', required: false })
    tokenId?: number

  @ApiProperty({ description: 'The type of token.', required: true, example: 'ERC20', enum: TokenType, enumName: 'tokenType', isArray: true })
    tokenType: string

  @ApiProperty({ description: 'The address of the token contract.', required: false, example: '0x1234567890abcdef' })
    tokenAddress?: string

  @ApiProperty({ description: 'The name of the token.', required: false, example: 'USDC' })
    tokenName?: string

  @ApiProperty({ description: 'The symbol of the token.', required: false, example: 'USDC' })
    tokenSymbol?: string

  @ApiProperty({ description: 'The number of decimal places for the token.', required: false, example: '6' })
    tokenDecimals?: string

  @ApiProperty({ description: 'The block number.', required: true, example: 1234567890 })
    blockNumber: number
}
