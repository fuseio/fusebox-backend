import { ConflictException, Inject, Injectable } from '@nestjs/common'
import { Model } from 'mongoose'
import { CreateOperatorDto } from '@app/accounts-service/operators/dto/create-operator.dto'
import { Operator } from '@app/accounts-service/operators/interfaces/operator.interface'
import { operatorModelString } from '@app/accounts-service/operators/operators.constants'

@Injectable()
export class OperatorsService {
  constructor (
    @Inject(operatorModelString)
    private operatorModel: Model<Operator>
  ) { }

  async create (createOperatorDto: CreateOperatorDto): Promise<Operator> {
    const existingOperator = await this.findOne(
      "smartContractAccountAddress",
      createOperatorDto.smartContractAccountAddress
    );

    if (existingOperator) {
      throw new ConflictException('Operator already exists');
    }

    const createdOperator = new this.operatorModel(createOperatorDto)
    return createdOperator.save()
  }

  async findOne (key: string, value: string): Promise<Operator> {
    return this.operatorModel.findOne({ [key]: value }).exec()
  }
}
