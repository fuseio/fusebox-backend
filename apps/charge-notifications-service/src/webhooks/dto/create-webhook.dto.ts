import { IsIn, IsString, IsUrl } from 'class-validator'
import { eventTypes } from '@app/notifications-service/webhooks/schemas/webhook.schema'

export class CreateWebhookDto {
  @IsString()
    projectId: string

  @IsUrl()
    webhookUrl: string

  @IsString()
  @IsIn(eventTypes)
    eventType: string
}
