import { Connection } from 'mongoose'
import { WebhookSchema } from '@app/notifications-service/webhooks/schemas/webhook.schema'
import { webhookModelString } from '@app/notifications-service/webhooks/webhooks.constants'
import { databaseConnectionString } from '@app/common/constants/database.constants'

export const webhookssProviders = [
  {
    provide: webhookModelString,
    useFactory: (connection: Connection) =>
      connection.model('Webhook', WebhookSchema),
    inject: [databaseConnectionString]
  }
]
