import { Connection } from 'mongoose';
import { ApiKeySchema } from '@app/payments-service/api-keys/schemas/api-key.schema';
import * as constants from '@app/payments-service/api-keys/api-keys.constants';

export const apiKeysProviders = [
  {
    provide: constants.apiKeyModelString,
    useFactory: (connection: Connection) =>
      connection.model('ApiKey', ApiKeySchema),
    inject: [constants.databaseConnectionString],
  },
];
