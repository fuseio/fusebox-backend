import { ApiProperty } from '@nestjs/swagger'
import { eventTypes } from '../schemas/webhook.schema'

export class CreateWebhook {
  @ApiProperty({ example: '2233232', description: 'The project ID.' })
    projectId: string

  @ApiProperty({ example: 'https://example.com/webhook', description: 'The URL to send notifications to.' })
    webhookUrl: string

  @ApiProperty({ example: 'ALL', description: 'The event type to listen for.', enum: eventTypes, enumName: 'eventType', isArray: true })
    eventType: string
}
