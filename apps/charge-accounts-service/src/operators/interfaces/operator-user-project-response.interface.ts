import { OperatorUser } from '@app/accounts-service/operators/interfaces/operator-user-interface'
import { OperatorProject } from '@app/accounts-service/operators/interfaces/operator-project.interface'

export interface OperatorUserProjectResponse {
  user: OperatorUser;
  project: OperatorProject;
}
