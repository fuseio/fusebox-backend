import { Injectable } from '@nestjs/common'
import { NATIVE_FUSE_ADDRESS } from '@app/notifications-service/common/constants/addresses'
import { get } from 'lodash'

@Injectable()
export class TokenAddressMapper {
  getTokenAddress (tokenAddress: string): string {
    return get({
      [NATIVE_FUSE_ADDRESS.toLowerCase()]: '0x0BE9e53fd7EDaC9F859882AfdDa116645287C629'.toLowerCase()
    }, tokenAddress.toLowerCase(), tokenAddress.toLowerCase())
  }
}
