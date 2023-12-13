import { Injectable } from '@nestjs/common'
import { AuthOperatorDto } from '@app/accounts-service/operators/dto/auth-operator.dto'
import { JwtService } from '@nestjs/jwt'
import { ethers } from 'ethers'

@Injectable()
export class OperatorsService {
  constructor (
    private readonly jwtService: JwtService
  ) { }

  verifySignature (authOperatorDto: AuthOperatorDto): string {
    const recoveredAddress = ethers.utils.verifyMessage(authOperatorDto.message, authOperatorDto.signature)
    return recoveredAddress
  }

  async createJwt(address: string): Promise<string> {
    return this.jwtService.sign({
      sub: address
    });
  }  
}
