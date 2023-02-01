export enum websocketMessages {
  JOB_STARTED = 'jobStarted',
  JOB_SUCCEEDED = 'jobSucceeded',
  JOB_FAILED = 'jobFailed',
  SUBSCRIBE = 'subscribe'
}

export enum websocketEvents {
  WALLET_CREATION_STARTED = 'smartWalletCreationStarted',
  WALLET_CREATION_FAILED = 'smartWalletCreationFailed',
  WALLET_CREATION_SUCCEEDED = 'smartWalletCreationSucceeded',
  TRANSACTION_STARTED = 'transactionStarted',
  TRANSACTION_FAILED = 'transactionFailed',
  TRANSACTION_SUCCEEDED = 'transactionSucceeded',
}
