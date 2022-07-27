import { IsEthereumAddress, IsString } from 'class-validator'

export class CreateWebhookAddressesDto {
  @IsString()
    webhookId: string

  @IsEthereumAddress({ each: true })
    addresses: string[]
}
