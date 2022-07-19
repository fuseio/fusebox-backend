import { Injectable } from '@nestjs/common'

@Injectable()
export class ChargeNotificationsService {
  getHello (): string {
    return 'Hello World!'
  }
}
