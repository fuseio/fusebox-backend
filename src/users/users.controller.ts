import { Controller, Get, Post, Body, UseGuards, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { SubmitQuestionnaireDto } from './dto/submit-questionnaire.dto';
import { IsAccountOwnerGuard } from './guards/is-account-owner.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @UseGuards(JwtAuthGuard, IsAccountOwnerGuard)
  @Post('/questionnaire/:id')
  submitQuestionnaire(@Param() { id }, @Body() submitQuestionnaireDto: SubmitQuestionnaireDto) {
    return this.usersService.submitQuestionnaire(id, submitQuestionnaireDto);
  }
}
