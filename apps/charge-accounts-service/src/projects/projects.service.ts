import { CreateProjectDto } from '@app/accounts-service/projects/dto/create-project.dto'
import { UpdateProjectDto } from '@app/accounts-service/projects/dto/update-project.dto'
import { Project } from '@app/accounts-service/projects/interfaces/project.interface'
import { projectModelString } from '@app/accounts-service/projects/projects.constants'
import { UsersService } from '@app/accounts-service/users/users.service'
import { apiService } from '@app/common/constants/microservices.constants'
import { Inject, Injectable } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { Model } from 'mongoose'
import { callMSFunction } from '@app/common/utils/client-proxy'

@Injectable()
export class ProjectsService {
  constructor (
    @Inject(apiService) private readonly apiClient: ClientProxy,
    // @Inject(relayService) private readonly relayClient: ClientProxy,
    @Inject(projectModelString)
    private projectModel: Model<Project>,
    private usersService: UsersService
  ) { }

  async create (createProjectDto: CreateProjectDto): Promise<Project> {
    const createdProject = new this.projectModel(createProjectDto)
    const projectId = createdProject._id

    await callMSFunction(this.apiClient, 'create_public', projectId)

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
    const secret = await callMSFunction(this.apiClient, 'create_secret', projectId)
    // if (secret) {
    //   callMSFunction(this.relayClient, 'create_account', projectId)
    // }
    return secret
  }

  async checkIfSecretExists (projectId: string) {
    const apiKeysInfo = await callMSFunction(this.apiClient, 'get_api_keys_info', projectId)

    if (apiKeysInfo?.secretLastFourChars) {
      return true
    }
    return false
  }

  async getApiKeysInfo (projectId: string) {
    return callMSFunction(this.apiClient, 'get_api_keys_info', projectId)
  }

  async updateSecret (projectId: string) {
    return callMSFunction(this.apiClient, 'update_secret', projectId)
  }

  async getPublic (projectId: string) {
    return callMSFunction(this.apiClient, 'get_public', projectId)
  }
}
