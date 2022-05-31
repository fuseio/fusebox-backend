import { Connection } from 'mongoose';
import { UserSchema } from '@app/accounts-service/users/schemas/user.schema';
import * as constants from '@app/accounts-service/users/users.constants';

export const usersProviders = [
  {
    provide: constants.userModelString,
    useFactory: (connection: Connection) =>
      connection.model('User', UserSchema),
    inject: [constants.databaseConnectionString],
  },
];
