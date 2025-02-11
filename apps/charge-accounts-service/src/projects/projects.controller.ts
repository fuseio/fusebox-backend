import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards
} from '@nestjs/common'
import { JwtAuthGuard } from '@app/accounts-service/auth/guards/jwt-auth.guard'
import { User } from '@app/accounts-service/users/user.decorator'
import { CreateProjectDto } from '@app/accounts-service/projects/dto/create-project.dto'
import { UpdateProjectDto } from '@app/accounts-service/projects/dto/update-project.dto'
import { IsCreatorOwnerGuard } from '@app/accounts-service/projects/guards/is-creator-owner.guard'
import { IsProjectOwnerGuard } from '@app/accounts-service/projects/guards/is-project-owner.guard'
import { ProjectsService } from '@app/accounts-service/projects/projects.service'
import { MessagePattern } from '@nestjs/microservices'
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger'

@ApiTags('Projects')
@Controller({ path: 'projects', version: '1' })
export class ProjectsController {
  constructor (private readonly projectsService: ProjectsService) { }

  /**
   * Creates a new project for the authenticated user
   * @param createProjectDto
   */
  @UseGuards(JwtAuthGuard, IsCreatorOwnerGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new project.' })
  @ApiCreatedResponse({ description: 'The project has been successfully created.' })
  create (@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto)
  }

  /**
   * Finds all the projects of the authenticated user
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Find all the projects of the authenticated user.' })
  @ApiCreatedResponse({ description: 'The projects have been successfully fetched.' })
  findAll (@User('sub') auth0Id: string) {
    return this.projectsService.findAll(auth0Id)
  }

  /**
   * Fetches the project by the given id and verifies that the requesting
   * authenticated user is the owner of the project
   * @param id Project ID
   */
  @UseGuards(JwtAuthGuard, IsProjectOwnerGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get project by id.' })
  @ApiCreatedResponse({ description: 'The project has been successfully fetched.' })
  findOne (@Param('id') id: string) {
    return this.projectsService.findOne(id)
  }

  @UseGuards(JwtAuthGuard, IsProjectOwnerGuard)
  @Get('/paymaster/:sponsorId')
  @ApiOperation({ summary: 'Get project by sponsor id.' })
  @ApiCreatedResponse({ description: 'The project has been successfully fetched.' })
  getProjectBySponsorId (@Param('sponsorId') sponsorId: string) {
    return this.projectsService.getProjectBySponsorId(sponsorId)
  }

  /**
   * Updates the project with the given id with the given fields for the update
   * and verifies that the requesting authenticated user is the owner of the project
   * @param id Project ID
   * @param updateProjectDto
   */
  @UseGuards(JwtAuthGuard, IsProjectOwnerGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update the project with the given id.' })
  @ApiCreatedResponse({ description: 'The project has been successfully updated.' })
  update (@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(id, updateProjectDto)
  }

  /**
   * Creates an API key secret for the given project
   * @param projectId
   * @returns the generated API key secret or error if secret already exists
   */
  @UseGuards(JwtAuthGuard, IsProjectOwnerGuard)
  @Post('/secret/:projectId')
  @ApiOperation({ summary: 'Create an API key secret for the given project.' })
  @ApiCreatedResponse({ description: 'The API key secret has been successfully created.' })
  createSecret (@Param('projectId') projectId: string) {
    return this.projectsService.createSecret({ projectId, createLegacyAccount: true })
  }

  /**
   * Checks if an API key secret for the given project exists
   * @param projectId
   * @returns true if secret exists for the given project, false otherwise
   */
  @UseGuards(JwtAuthGuard, IsProjectOwnerGuard)
  @Get('/secret/:projectId')
  @ApiOperation({ summary: 'Check if an API key secret for the given project exists.' })
  @ApiCreatedResponse({ description: 'The API key secret exists.' })
  checkIfSecretExists (@Param('projectId') projectId: string) {
    return this.projectsService.checkIfSecretExists(projectId)
  }

  /**
   * Gets api keys unsensitive info for the given projectId
   * @param projectId
   * @returns an object containing the unsensitive fields of api keys
   */
  @UseGuards(JwtAuthGuard, IsProjectOwnerGuard)
  @Get('/apikeysinfo/:projectId')
  @ApiOperation({ summary: 'Get API keys unsensitive info for the given project.' })
  @ApiCreatedResponse({ description: 'The API keys unsensitive info has been successfully fetched.' })
  getApiKeysInfo (@Param('projectId') projectId: string) {
    return this.projectsService.getApiKeysInfo(projectId)
  }

  /**
   * Revokes the old API key secret and generates a new one for the given project
   * @param projectId
   * @returns the new API key secret
   */
  @UseGuards(JwtAuthGuard, IsProjectOwnerGuard)
  @Put('/secret/:projectId')
  @ApiOperation({ summary: 'Revokes the old API key secret and generates a new one for the given project.' })
  @ApiCreatedResponse({ description: 'The API key secret has been successfully updated.' })
  updateSecret (@Param('projectId') projectId: string) {
    return this.projectsService.updateSecret(projectId)
  }

  /**
   * Gets the public API key associated with the project
   * @param projectId
   * @returns the public API key associated with the given project
   */
  @UseGuards(JwtAuthGuard, IsProjectOwnerGuard)
  @Get('/public/:projectId')
  @ApiOperation({ summary: 'Get the public API key associated with the project.' })
  @ApiCreatedResponse({ description: 'The public API key associated with the project.' })
  getPublic (@Param('projectId') projectId: string) {
    return this.projectsService.getPublic(projectId)
  }

  /**
    * Creates an sandbox API key for the given project
    * @param projectId
    * @returns the generated sandbox API key or error if key already exists
    */
  @UseGuards(JwtAuthGuard, IsProjectOwnerGuard)
  @Post('/sandbox/:projectId')
  @ApiOperation({ summary: 'Create a sandbox API key for the given project.' })
  @ApiCreatedResponse({ description: 'The sandbox API key has been successfully created.' })
  createSandboxKey (@Param('projectId') projectId: string) {
    return this.projectsService.createSandboxKey(projectId)
  }

  /**
   * Gets the sandbox API key associated with the project
   * @param projectId
   * @returns the sandbox API key associated with the given project
   */
  @UseGuards(JwtAuthGuard, IsProjectOwnerGuard)
  @Get('/sandbox/:projectId')
  @ApiOperation({ summary: 'Get the sandbox API key associated with the project.' })
  @ApiCreatedResponse({ description: 'The sandbox API key associated with the project.' })
  getSandboxKey (@Param('projectId') projectId: string) {
    return this.projectsService.getSandboxKey(projectId)
  }

  @MessagePattern('find-one-project')
  findOneInternal (id: string) {
    return this.projectsService.findOne(id)
  }

  @MessagePattern('find-one-project-by-owner-id')
  findOneByIdInternal (id: string) {
    return this.projectsService.findOneByOwnerId(id)
  }

  @MessagePattern('get-public')
  getPublicInternal (projectId: string) {
    return this.projectsService.getPublic(projectId)
  }
}
