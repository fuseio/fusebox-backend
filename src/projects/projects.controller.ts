import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/users/user.decorator';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { IsCreatorOwnerGuard } from './guards/is-creator-owner.guard';
import { IsProjectOwnerGuard } from './guards/is-project-owner.guard';
import { ProjectsService } from './projects.service';

@Controller({ path: 'projects', version: '1' })
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) { }

  /**
   * Creates a new project for the authenticated user
   * @param createProjectDto
   */
  @UseGuards(JwtAuthGuard, IsCreatorOwnerGuard)
  @Post()
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  /**
   * Finds all the projects of the authenticated user
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@User('sub') auth0Id: string) {
    return this.projectsService.findAll(auth0Id);
  }

  /**
   * Fetches the project by the given id and verifies that the requesting
   * authenticated user is the owner of the project
   * @param id Project ID
   */
  @UseGuards(JwtAuthGuard, IsProjectOwnerGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  /**
   * Updates the project with the given id with the given fields for the update
   * and verifies that the requesting authenticated user is the owner of the project
   * @param id Project ID
   * @param updateProjectDto
   */
  @UseGuards(JwtAuthGuard, IsProjectOwnerGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(id, updateProjectDto);
  }

  @UseGuards(JwtAuthGuard, IsProjectOwnerGuard)
  @Post('/createlegacyjwt/:id')
  createLegacyJwt(@Param('id') id: string) {
    return this.projectsService.createLegacyJwt(id);
  }
}
