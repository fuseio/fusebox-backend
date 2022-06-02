import { Inject, Injectable } from '@nestjs/common'
import { Model } from 'mongoose'
import { CreateUserDto } from '@app/accounts-service/users/dto/create-user.dto'
import { SubmitQuestionnaireDto } from '@app/accounts-service/users/dto/submit-questionnaire.dto'
import { User } from '@app/accounts-service/users/interfaces/user.interface'
import { userModelString } from '@app/accounts-service/users/users.constants'

@Injectable()
export class UsersService {
  constructor (
    @Inject(userModelString)
    private userModel: Model<User>
  ) {}

  async create (createUserDto: CreateUserDto): Promise<User> {
    // TODO: When a user already exists, throw a custom exception of user already exists instead of internal server error
    const createdUser = new this.userModel(createUserDto)
    return createdUser.save()
  }

  async findAll (): Promise<User[]> {
    return this.userModel.find().exec()
  }

  async findOne (id: string): Promise<User> {
    return this.userModel.findOne({ _id: id }).exec()
  }

  async findOneByAuth0Id (id: string): Promise<User> {
    return this.userModel.findOne({ auth0Id: id }).exec()
  }

  async submitQuestionnaire (
    id: string,
    submitQuestionnaireDto: SubmitQuestionnaireDto
  ) {
    return await this.userModel.findByIdAndUpdate(
      id,
      { questionnaire: submitQuestionnaireDto.questionnaire },
      { new: true }
    )
  }
}
