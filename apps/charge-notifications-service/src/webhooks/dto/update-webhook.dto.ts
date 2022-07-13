import { PartialType } from '@nestjs/mapped-types'
import { CreateWebhookDto } from '@app/notifications-service/webhooks/dto/create-webhook.dto'
import { IsString } from 'class-validator'

export class UpdateWebhookDto extends PartialType(CreateWebhookDto) {
    @IsString()
      webhookId: string
}
