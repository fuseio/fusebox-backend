import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { SubmitQuestionnaireDto } from './dto/submit-questionnaire.dto';
import { User } from './interfaces/user.interface';
import * as constants from './users.constants';

@Injectable()
export class UsersService {
  constructor(
    @Inject(constants.userModelString)
    private userModel: Model<User>,
  ) { }


  async create(createUserDto: CreateUserDto): Promise<User> {
    //TODO: When a user already exists, throw a custom exception of user already exists instead of internal server error
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<User> {
    return this.userModel.findOne({ _id: id }).exec();
  }

  async findOneByAuth0Id(id: string): Promise<User> {
    return this.userModel.findOne({ auth0_id: id }).exec();
  }

  async submitQuestionnaire(id: string, submitQuestionnaireDto: SubmitQuestionnaireDto) {
    return await this.userModel.findByIdAndUpdate(id,
      { questionnaire: submitQuestionnaireDto.questionnaire }
    );
  }
}
