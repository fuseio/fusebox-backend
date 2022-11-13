import { databaseConnectionString } from '@app/common/constants/database.constants'
import { webhookEventModelString } from '@app/notifications-service/common/constants/webhook-event.constants'
import { WebhookEventSchema } from '@app/notifications-service/common/schemas/webhook-event.schema'
import { Connection } from 'mongoose'

export const webhookEventProviders = [
  {
    provide: webhookEventModelString,
    useFactory: (connection: Connection) =>
      connection.model('WebhookEvent', WebhookEventSchema),
    inject: [databaseConnectionString]
  }
]
