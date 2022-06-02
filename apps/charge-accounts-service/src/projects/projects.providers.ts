import { Connection } from 'mongoose';
import { ProjectSchema } from '@app/accounts-service/projects/schemas/project.schema';
import { projectModelString } from '@app/accounts-service/projects/projects.constants';
import { databaseConnectionString } from '@app/common/constants/database.constants';

export const projectsProviders = [
  {
    provide: projectModelString,
    useFactory: (connection: Connection) =>
      connection.model('Project', ProjectSchema),
    inject: [databaseConnectionString],
  },
];
