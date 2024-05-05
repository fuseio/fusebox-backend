import { PartialType } from '@nestjs/mapped-types'
import { ApiProperty } from '@nestjs/swagger'
import { CreateWebhook } from '@app/notifications-service/webhooks/entities/create-webhook.entity'

export class UpdateWebhook extends PartialType(CreateWebhook) {
  @ApiProperty({ example: '2233232', description: 'The webhook ID.' })
    webhookId: string
}
