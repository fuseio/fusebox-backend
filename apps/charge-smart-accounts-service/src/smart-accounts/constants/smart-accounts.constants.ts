export enum websocketMessages {
  JOB_STARTED = 'jobStarted',
  JOB_SUCCEEDED = 'jobSucceeded',
  JOB_FAILED = 'jobFailed',
  SUBSCRIBE = 'subscribe'
}

export enum websocketEvents {
  ACCOUNT_CREATION_STARTED = 'smartAccountCreationStarted',
  ACCOUNT_CREATION_FAILED = 'smartAccountCreationFailed',
  ACCOUNT_CREATION_SUCCEEDED = 'smartAccountCreationSucceeded',
  TRANSACTION_STARTED = 'transactionStarted',
  TRANSACTION_FAILED = 'transactionFailed',
  TRANSACTION_SUCCEEDED = 'transactionSucceeded',
}
