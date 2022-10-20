import { IsIn, IsString, IsUrl } from 'class-validator'
import { eventTypes } from '@app/notifications-service/webhooks/schemas/webhook.schema'

export class CreateWebhookDto {
  @IsString()
    projectId: string

  @IsUrl({require_tld: false})
    webhookUrl: string

  @IsString()
  @IsIn(Object.values(eventTypes))
    eventType: string
}
