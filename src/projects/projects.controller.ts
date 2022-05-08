import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/users/user.decorator';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
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

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@User('sub') auth0_id: string) {
    return this.projectsService.findAll(auth0_id);
  }

  @UseGuards(JwtAuthGuard, IsProjectOwnerGuard)
  @Get(':id')
  findOne(@Param() { id }) {
    return this.projectsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, IsProjectOwnerGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(id, updateProjectDto);
  }
}
