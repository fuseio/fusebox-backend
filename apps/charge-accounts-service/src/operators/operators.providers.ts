import { Connection } from 'mongoose'
import { OperatorWalletSchema } from '@app/accounts-service/operators/schemas/operator-wallet.schema'
import { operatorInvoiceModelString, operatorPaymentMethodModelString, operatorPricingPlanModelString, operatorWalletModelString } from '@app/accounts-service/operators/operators.constants'
import { databaseConnectionString } from '@app/common/constants/database.constants'
import { OperatorInvoiceSchema } from '@app/accounts-service/operators/schemas/operator-invoice.schema'
import { OperatorPaymentMethodSchema } from '@app/accounts-service/operators/schemas/operator-payment-method.schema'
import { OperatorPricingPlanSchema } from '@app/accounts-service/operators/schemas/operator-pricing-plan.schema'

export const operatorsProviders = [
  {
    provide: operatorWalletModelString,
    useFactory: (connection: Connection) =>
      connection.model('OperatorWallet', OperatorWalletSchema),
    inject: [databaseConnectionString]
  },
  {
    provide: operatorInvoiceModelString,
    useFactory: (connection: Connection) =>
      connection.model('OperatorInvoice', OperatorInvoiceSchema),
    inject: [databaseConnectionString]
  },
  {
    provide: operatorPaymentMethodModelString,
    useFactory: (connection: Connection) =>
      connection.model('OperatorPaymentMethod', OperatorPaymentMethodSchema),
    inject: [databaseConnectionString]
  },
  {
    provide: operatorPricingPlanModelString,
    useFactory: (connection: Connection) =>
      connection.model('OperatorPricingPlan', OperatorPricingPlanSchema),
    inject: [databaseConnectionString]
  }
]
