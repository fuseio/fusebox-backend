import { ApiProperty } from '@nestjs/swagger'

export class CreateOperatorWallet {
  @ApiProperty({ example: '0x', description: 'The address of the owner of the wallet' })
    ownerId: string

  @ApiProperty({ example: '0x', description: 'The address of the smart wallet' })
    smartWalletAddress: string

  @ApiProperty({ example: true, description: 'Whether the wallet is activated' })
    isActivated: boolean
}
