import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateProjectDto } from './dto/create-project.dto';
import { IsCreatorOwnerGuard } from './guards/is-creator-owner.guard';
import { IsProjectOwnerGuard } from './guards/is-project-owner.guard';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) { }

  @UseGuards(JwtAuthGuard, IsCreatorOwnerGuard)
  @Post()
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  @UseGuards(JwtAuthGuard, IsProjectOwnerGuard)
  @Get(':id')
  get(@Param() { id }) {
    return this.projectsService.getProject(id);
  }
}
