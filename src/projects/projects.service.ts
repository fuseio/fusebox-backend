import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { CreateProjectDto } from './dto/create-project.dto';
import { Project } from './interfaces/project.interface';
import * as constants from './projects.constants';

@Injectable()
export class ProjectsService {
    constructor(
        @Inject(constants.projectModelString)
        private projectModel: Model<Project>,
    ) { }

    async create(createProjectDto: CreateProjectDto): Promise<Project> {
        const createdProject = new this.projectModel(createProjectDto);
        return createdProject.save();
    }

    async getProject(id: string): Promise<Project> {
        return this.projectModel.findById(id)
    }
}
