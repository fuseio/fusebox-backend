import { Body, Controller } from '@nestjs/common'
import { MessagePattern } from '@nestjs/microservices'
import { ConsensusService } from '@app/network-service/consensus/consensus.service'
import { DelegatedAmountsDto } from '@app/network-service/consensus/dto/consensus.dto'

@Controller('consensus')
export class ConsensusController {
  constructor (private readonly consensusService: ConsensusService) { }

  @MessagePattern('get_validators')
  getValidators () {
    return this.consensusService.getCachedValidatorsInfo()
  }

  @MessagePattern('delegated_amounts')
  getDelegatedAmounts (@Body() delegatedAmountsDto: DelegatedAmountsDto) {
    return this.consensusService.getDelegatedAmounts(delegatedAmountsDto)
  }

  @MessagePattern('delegate')
  delegate (@Body() data: { validator: string }) {
    return this.consensusService.delegate(data.validator)
  }

  @MessagePattern('withdraw')
  withdraw (@Body() data: { validator: string, amount: string }) {
    return this.consensusService.withdraw(data.validator, data.amount)
  }
}
