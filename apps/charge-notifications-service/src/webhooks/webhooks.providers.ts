import { Connection } from 'mongoose'
import { WebhookSchema } from '@app/notifications-service/webhooks/schemas/webhook.schema'
import { WebhookAddressSchema } from '@app/notifications-service/webhooks/schemas/webhook-address.schema'
import { webhookModelString, webhookAddressModelString } from '@app/notifications-service/webhooks/webhooks.constants'
import { databaseConnectionString } from '@app/common/constants/database.constants'

export const webhookssProviders = [
  {
    provide: webhookModelString,
    useFactory: (connection: Connection) =>
      connection.model('Webhook', WebhookSchema),
    inject: [databaseConnectionString]
  },
  {
    provide: webhookAddressModelString,
    useFactory: (connection: Connection) =>
      connection.model('WebhookAddress', WebhookAddressSchema),
    inject: [databaseConnectionString]
  }
]
