import { PartialType } from '@nestjs/mapped-types'
import { CreateWebhookDto } from '@app/notifications-service/webhooks/dto/create-webhook.dto'
import { IsEthereumAddress, IsOptional, IsString } from 'class-validator'

export class UpdateWebhookDto extends PartialType(CreateWebhookDto) {
    @IsString()
      webhookId: string

    @IsOptional()
    @IsEthereumAddress({ each: true })
      addAddresses: string[]

    @IsOptional()
    @IsEthereumAddress({ each: true })
      removeAddresses: string[]
}
