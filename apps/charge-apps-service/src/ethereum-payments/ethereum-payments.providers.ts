import { databaseConnectionString } from '@app/common/constants/database.constants'
import { Connection } from 'mongoose'
import { ethereumBackendWalletModelString } from '@app/apps-service/ethereum-payments/ethereum-backend-wallet.constants'
import { ethereumFundingAccountModelString, ethereumPaymentLinkModelString } from '@app/apps-service/ethereum-payments/ethereum-payments.constants'
import { EthereumBackendWalletSchema } from '@app/apps-service/ethereum-payments/schemas/ethereum-backend-wallet.schema'
import { EthereumFundingAccountSchema } from '@app/apps-service/ethereum-payments/schemas/ethereum-funding-account.schema'
import { EthereumPaymentLinkSchema } from '@app/apps-service/ethereum-payments/schemas/ethereum-payment-link.schema'

export const ethereumPaymentsProviders = [
  {
    provide: ethereumPaymentLinkModelString,
    useFactory: (connection: Connection) =>
      connection.model('EthereumPaymentLink', EthereumPaymentLinkSchema),
    inject: [databaseConnectionString]
  },
  {
    provide: ethereumFundingAccountModelString,
    useFactory: (connection: Connection) =>
      connection.model('EthereumFundingAccount', EthereumFundingAccountSchema),
    inject: [databaseConnectionString]
  },
  {
    provide: ethereumBackendWalletModelString,
    useFactory: (connection: Connection) =>
      connection.model('EthereumBackendWallet', EthereumBackendWalletSchema),
    inject: [databaseConnectionString]
  }
]
