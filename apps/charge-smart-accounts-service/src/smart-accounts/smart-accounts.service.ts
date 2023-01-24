import { SmartAccountsAuthDto } from '@app/smart-accounts-service/dto/smart-accounts-auth.dto'
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { arrayify, computeAddress, hashMessage, recoverPublicKey } from 'nestjs-ethers'

@Injectable()
export class SmartAccountsService {
  private readonly logger = new Logger(SmartAccountsService.name)

  constructor (
        private readonly jwtService: JwtService
  ) { }

  async auth (smartAccountsAuthDto: SmartAccountsAuthDto) {
    try {
      const publicKey = recoverPublicKey(arrayify(hashMessage(arrayify(smartAccountsAuthDto.hash))), smartAccountsAuthDto.sig)
      const recoveredAddress = computeAddress(publicKey)

      if (recoveredAddress === smartAccountsAuthDto.ownerAddress) {
        return { jwt: this.jwtService.sign({ ownerAddress: recoveredAddress }) }
      } else {
        throw new Error('Owner Address does not match recovered address in signature')
      }
    } catch (err) {
      this.logger.error(`An error occurred during Smart Accounts Auth. ${err}`)
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST)
    }
  }
}
