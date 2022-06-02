import { Connection } from 'mongoose';
import { UserSchema } from '@app/accounts-service/users/schemas/user.schema';
import { userModelString } from '@app/accounts-service/users/users.constants';
import { databaseConnectionString } from '@app/common/constants/database.constants';

export const usersProviders = [
  {
    provide: userModelString,
    useFactory: (connection: Connection) =>
      connection.model('User', UserSchema),
    inject: [databaseConnectionString],
  },
];
