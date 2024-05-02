import { ApiProperty } from '@nestjs/swagger'

export class CreateWebhookAddresses {
  @ApiProperty({ example: '2233232', description: 'The webhook ID.' })
    webhookId: string

  @ApiProperty({
    example: ['0x', '0x'],
    description: 'The addresses to add to the webhook.'
  })
    addresses: string[]
}
