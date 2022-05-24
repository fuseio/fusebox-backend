import { Connection } from 'mongoose';
import { UserSchema } from './schemas/user.schema';
import * as constants from './users.constants';

export const usersProviders = [
  {
    provide: constants.userModelString,
    useFactory: (connection: Connection) =>
      connection.model('User', UserSchema),
    inject: [constants.databaseConnectionString],
  },
];
