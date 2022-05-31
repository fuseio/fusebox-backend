import { Connection } from 'mongoose';
import { ProjectSchema } from '@app/accounts-service/projects/schemas/project.schema';
import * as constants from '@app/accounts-service/projects/projects.constants';

export const projectsProviders = [
  {
    provide: constants.projectModelString,
    useFactory: (connection: Connection) =>
      connection.model('Project', ProjectSchema),
    inject: [constants.databaseConnectionString],
  },
];
