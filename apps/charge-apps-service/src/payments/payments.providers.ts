import { Connection } from 'mongoose'
import { paymentLinkModelString, paymentAccountModelString } from '@app/apps-service/payments/payments.constants'
import { databaseConnectionString } from '@app/common/constants/database.constants'
import { PaymentLinkSchema } from '@app/apps-service/payments/schemas/payment-link.schema'
import { PaymentAccountSchema } from '@app/apps-service/payments/schemas/payment-account.schema'

export const paymentsProviders = [
  {
    provide: paymentLinkModelString,
    useFactory: (connection: Connection) =>
      connection.model('PaymentLink', PaymentLinkSchema),
    inject: [databaseConnectionString]
  },
  {
    provide: paymentAccountModelString,
    useFactory: (connection: Connection) =>
      connection.model('PaymentAccount', PaymentAccountSchema),
    inject: [databaseConnectionString]
  }
]
