import { IsNotEmptyObject, IsObject } from 'class-validator';

export class SubmitQuestionnaireDto {
  @IsObject()
  @IsNotEmptyObject()
  questionnaire: object;
}
