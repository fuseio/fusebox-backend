import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Model } from 'mongoose';
import { catchError, lastValueFrom, takeLast } from 'rxjs';
import { UsersService } from '@app/accounts-service/users/users.service';
import { CreateProjectDto } from '@app/accounts-service/projects/dto/create-project.dto';
import { UpdateProjectDto } from '@app/accounts-service/projects/dto/update-project.dto';
import { Project } from '@app/accounts-service/projects/interfaces/project.interface';
import * as constants from '@app/accounts-service/projects/projects.constants';

@Injectable()
export class ProjectsService {
  constructor(
    @Inject('CHARGE_API_SERVICE') private readonly apiClient: ClientProxy,
    @Inject(constants.projectModelString)
    private projectModel: Model<Project>,
    private usersService: UsersService,
  ) { }

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    const createdProject = new this.projectModel(createProjectDto);
    const projectId = createdProject._id;

    this.callApiFunction('create_public', projectId);

    return createdProject.save();
  }

  async findOne(id: string): Promise<Project> {
    return this.projectModel.findById(id);
  }

  async findAll(auth0Id: string): Promise<Project[]> {
    const userId = await this.usersService.findOneByAuth0Id(auth0Id);
    return this.projectModel.find({ ownerId: userId });
  }

  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
  ): Promise<Project> {
    return this.projectModel.findByIdAndUpdate(id, updateProjectDto, {
      new: true,
    });
  }

  async createSecret(projectId: string) {
    return this.callApiFunction('create_secret', projectId);
  }

  async checkIfSecretExists(projectId: string) {
    return this.callApiFunction('check_secret', projectId);
  }

  async updateSecret(projectId: string) {
    return this.callApiFunction('update_secret', projectId);
  }

  async getPublic(projectId: string) {
    return this.callApiFunction('get_public', projectId);
  }

  private async callApiFunction(pattern: string, data: string) {
    return lastValueFrom(
      this.apiClient
        .send(pattern, data)
        .pipe(takeLast(1))
        .pipe(
          catchError((val) => {
            throw new HttpException(
              val.message,
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }),
        ),
    );
  }
}
