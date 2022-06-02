import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { Model } from 'mongoose'
import { catchError, lastValueFrom, takeLast } from 'rxjs'
import { UsersService } from '@app/accounts-service/users/users.service'
import { CreateProjectDto } from '@app/accounts-service/projects/dto/create-project.dto'
import { UpdateProjectDto } from '@app/accounts-service/projects/dto/update-project.dto'
import { Project } from '@app/accounts-service/projects/interfaces/project.interface'
import { projectModelString } from '@app/accounts-service/projects/projects.constants'
import {
  apiService,
  relayService
} from '@app/common/constants/microservices.constants'

@Injectable()
export class ProjectsService {
  constructor (
    @Inject(apiService) private readonly apiClient: ClientProxy,
    @Inject(relayService) private readonly relayClient: ClientProxy,
    @Inject(projectModelString)
    private projectModel: Model<Project>,
    private usersService: UsersService
  ) { }

  async create (createProjectDto: CreateProjectDto): Promise<Project> {
    const createdProject = new this.projectModel(createProjectDto)
    const projectId = createdProject._id

    this.callMSFunction(this.apiClient, 'create_public', projectId)

    return createdProject.save()
  }

  async findOne (id: string): Promise<Project> {
    return this.projectModel.findById(id)
  }

  async findAll (auth0Id: string): Promise<Project[]> {
    const userId = await this.usersService.findOneByAuth0Id(auth0Id)
    return this.projectModel.find({ ownerId: userId })
  }

  async update (
    id: string,
    updateProjectDto: UpdateProjectDto
  ): Promise<Project> {
    return this.projectModel.findByIdAndUpdate(id, updateProjectDto, {
      new: true
    })
  }

  async createSecret (projectId: string) {
    const secret = await this.callMSFunction(this.apiClient, 'create_secret', projectId)
    if (secret) {
      this.callMSFunction(this.relayClient, 'create_account', projectId)
    }
    return secret
  }

  async checkIfSecretExists (projectId: string) {
    const apiKeysInfo = await this.callMSFunction(this.apiClient, 'get_api_keys_info', projectId)

    if (apiKeysInfo?.secretLastFourChars) {
      return true
    }
    return false
  }

  async getApiKeysInfo (projectId: string) {
    return this.callMSFunction(this.apiClient, 'get_api_keys_info', projectId)
  }

  async updateSecret (projectId: string) {
    return this.callMSFunction(this.apiClient, 'update_secret', projectId)
  }

  async getPublic (projectId: string) {
    return this.callMSFunction(this.apiClient, 'get_public', projectId)
  }

  private async callMSFunction (client: ClientProxy, pattern: string, data: string) {
    return lastValueFrom(
      client
        .send(pattern, data)
        .pipe(takeLast(1))
        .pipe(
          catchError((val) => {
            throw new HttpException(
              val.message,
              HttpStatus.INTERNAL_SERVER_ERROR
            )
          })
        )
    )
  }
}
