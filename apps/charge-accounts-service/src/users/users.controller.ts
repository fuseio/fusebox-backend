import { Controller, Post, Body, UseGuards, Param } from '@nestjs/common'
import { UsersService } from '@app/accounts-service/users/users.service'
import { JwtAuthGuard } from '@app/accounts-service/auth/guards/jwt-auth.guard'
import { SubmitQuestionnaireDto } from '@app/accounts-service/users/dto/submit-questionnaire.dto'
import { IsAccountOwnerGuard } from '@app/accounts-service/users/guards/is-account-owner.guard'
import { MessagePattern } from '@nestjs/microservices'

@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor (private readonly usersService: UsersService) { }

  /**
   * Submits questionnaire answers for the given user id and verifies that the authenticated
   * user has the given user id
   * @param id User ID
   * @param submitQuestionnaireDto
   */
  @UseGuards(JwtAuthGuard, IsAccountOwnerGuard)
  @Post('/questionnaire/:id')
  submitQuestionnaire (
    @Param('id') id: string,
    @Body() submitQuestionnaireDto: SubmitQuestionnaireDto
  ) {
    return this.usersService.submitQuestionnaire(id, submitQuestionnaireDto)
  }

  @MessagePattern('find-one-user')
  findOneInternal (id: string) {
    return this.usersService.findOne(id)
  }
}
