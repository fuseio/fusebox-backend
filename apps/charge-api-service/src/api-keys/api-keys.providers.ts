import { Connection } from 'mongoose';
import { ApiKeySchema } from 'apps/charge-api-service/src/api-keys/schemas/api-key.schema';
import * as constants from 'apps/charge-api-service/src/api-keys/api-keys.constants';

export const apiKeysProviders = [
  {
    provide: constants.apiKeyModelString,
    useFactory: (connection: Connection) =>
      connection.model('ApiKey', ApiKeySchema),
    inject: [constants.databaseConnectionString],
  },
];
