import { ApiProperty } from '@nestjs/swagger'

export class AuthOperator {
  @ApiProperty({ example: '0x', description: 'The address of the externally owned account' })
    externallyOwnedAccountAddress: string

  @ApiProperty({ example: 'message', description: 'The message to sign' })
    message: string

  @ApiProperty({ example: 'signature', description: 'The signature of the message' })
    signature: string
}
