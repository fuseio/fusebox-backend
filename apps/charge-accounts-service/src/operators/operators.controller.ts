import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common'
import { OperatorsService } from '@app/accounts-service/operators/operators.service'
import { AuthOperatorDto } from '@app/accounts-service/operators/dto/auth-operator.dto'

@Controller({ path: 'operators', version: '1' })
export class OperatorsController {
  constructor(private readonly operatorsService: OperatorsService) { }

  /**
   * Authenticate operator
   * @param authOperatorDto
 */
  @Post('/auth')
  authenticate (@Body() authOperatorDto: AuthOperatorDto) {    
    const recoveredAddress = this.operatorsService.verifySignature(authOperatorDto)

    if(authOperatorDto.externallyOwnedAccountAddress !== recoveredAddress) {
      throw new HttpException('Wallet ownership verification failed', HttpStatus.FORBIDDEN);
    }
    
    return this.operatorsService.createJwt(recoveredAddress)
  }
}
