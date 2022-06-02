import { Connection } from 'mongoose';
import { ApiKeySchema } from 'apps/charge-api-service/src/api-keys/schemas/api-key.schema';
import { apiKeyModelString } from 'apps/charge-api-service/src/api-keys/api-keys.constants';
import { databaseConnectionString } from '@app/common/constants/database.constants';

export const apiKeysProviders = [
  {
    provide: apiKeyModelString,
    useFactory: (connection: Connection) =>
      connection.model('ApiKey', ApiKeySchema),
    inject: [databaseConnectionString],
  },
];
