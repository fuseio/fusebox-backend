import { Injectable } from '@nestjs/common'

@Injectable()
export class ChargeAppsServiceService {
  getHello (): string {
    return 'Hello World!'
  }
}
