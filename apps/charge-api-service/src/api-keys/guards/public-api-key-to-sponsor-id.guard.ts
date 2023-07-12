import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { ApiKeysService } from 'apps/charge-api-service/src/api-keys/api-keys.service'
import { ProjectsService } from 'apps/charge-accounts-service/src/projects/projects.service'
import { isEmpty } from 'lodash'

@Injectable()
export class PublicApiKeyToSponsorIdGuard implements CanActivate {
    constructor(private apiKeysService: ApiKeysService, private projectsService: ProjectsService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest()
        const { query }: { query: { apiKey: string } } = request
        if (isEmpty(query?.apiKey)) return false
        const apiKey = await this.apiKeysService.findOne({ publicKey: query?.apiKey })
        if (isEmpty(apiKey)) return false
        console.log(await this.projectsService.findOne('63eca7eafe35abeb104588b8'));

        // const project = await this.projectsService.findOne(apiKey.projectId.toString())
        // console.log(project);

    }
}
