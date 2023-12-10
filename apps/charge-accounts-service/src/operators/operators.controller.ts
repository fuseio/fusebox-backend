import { Controller, Post, Body, Get, Param } from '@nestjs/common'
import { OperatorsService } from '@app/accounts-service/operators/operators.service'
import { CreateOperatorDto } from '@app/accounts-service/operators/dto/create-operator.dto'

@Controller({ path: 'operators', version: '1' })
export class OperatorsController {
  constructor(private readonly operatorsService: OperatorsService) { }

  /**
   * Registers a new operator
   * TODO: authenticate the user EOA by signing a message in frontend
   * and verifying it in the backend, need to think about a new architecture,
   * as operator is already signing additional message for Fusebox Web SDK
   * @param createOperatorDto
 */
  @Post('/register')
  create(@Body() createOperatorDto: CreateOperatorDto) {
    return this.operatorsService.create(createOperatorDto)
  }

  @Get('/public-data/:address')
  async findOneByAddress(@Param('address') address: string) {
    const operator = await this.operatorsService.findOne("externallyOwnedAccountAddress", address)
    return operator
  }
}
