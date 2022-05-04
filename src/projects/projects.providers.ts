import { Connection } from 'mongoose';
import { ProjectSchema } from './schemas/project.schema';
import * as constants from './projects.constants';

export const projectsProviders = [
    {
        provide: constants.projectModelString,
        useFactory: (connection: Connection) => connection.model('Project', ProjectSchema),
        inject: [constants.databaseConnectionString],
    },
];