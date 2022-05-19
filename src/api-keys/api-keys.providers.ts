import { Connection } from 'mongoose';
import { ApiKeySchema } from './schemas/api-key.schema';
import * as constants from './api-keys.constants';

export const apiKeysProviders = [
  {
    provide: constants.apiKeyModelString,
    useFactory: (connection: Connection) =>
      connection.model('ApiKey', ApiKeySchema),
    inject: [constants.databaseConnectionString],
  },
];
