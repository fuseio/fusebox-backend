import { Controller, Get, Post, Body, UseGuards, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { SubmitQuestionnaireDto } from './dto/submit-questionnaire.dto';
import { IsAccountOwnerGuard } from './guards/is-account-owner.guard';

@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  /**
   * Submits questionnaire answers for the given user id and verifies that the authenticated 
   * user has the given user id
   * @param id User ID
   * @param submitQuestionnaireDto 
   */
  @UseGuards(JwtAuthGuard, IsAccountOwnerGuard)
  @Post('/questionnaire/:id')
  submitQuestionnaire(@Param(':id') id: string, @Body() submitQuestionnaireDto: SubmitQuestionnaireDto) {
    return this.usersService.submitQuestionnaire(id, submitQuestionnaireDto);
  }
}
