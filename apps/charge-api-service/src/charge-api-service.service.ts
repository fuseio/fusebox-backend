import { Injectable } from '@nestjs/common'

@Injectable()
export class ChargeApiServiceService {
  getHello(): string {
    return 'Hello World!'
  }
}
