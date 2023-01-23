import { Injectable } from '@nestjs/common'

@Injectable()
export class ChargeSmartAccountsService {
  getHello (): string {
    return 'Hello World!'
  }
}
