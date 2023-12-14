import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ethers } from 'ethers'
import { AuthOperatorDto } from '@app/accounts-service/auth/dto/auth-operator.dto'

@Injectable()
export class AuthService {
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
