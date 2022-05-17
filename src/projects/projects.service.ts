import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { UsersService } from 'src/users/users.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './interfaces/project.interface';
import * as constants from './projects.constants';

@Injectable()
export class ProjectsService {
    constructor(
        @Inject(constants.projectModelString)
        private projectModel: Model<Project>,
        private usersService: UsersService,
    ) { }

    async create(createProjectDto: CreateProjectDto): Promise<Project> {
        const createdProject = new this.projectModel(createProjectDto);
        return createdProject.save();
    }

    async findOne(id: string): Promise<Project> {
        return this.projectModel.findById(id)
    }

    async findAll(auth0_id: string): Promise<Project[]> {
        const userId = await this.usersService.findOneByAuth0Id(auth0_id);
        return this.projectModel.find({ ownerId: userId });
    }

    async update(id: string, updateProjectDto: UpdateProjectDto): Promise<Project> {
        return this.projectModel.findByIdAndUpdate(id, updateProjectDto, { new: true });
    }
}