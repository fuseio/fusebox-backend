import { PartialType } from '@nestjs/mapped-types'
import { CreateProjectDto } from '@app/accounts-service/projects/dto/create-project.dto'

export class UpdateProjectDto extends PartialType(CreateProjectDto) { }
