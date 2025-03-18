import { Injectable } from '@nestjs/common'
import { NATIVE_FUSE_ADDRESS } from '@app/notifications-service/common/constants/addresses'
import { get } from 'lodash'
import { ConfigService } from '@nestjs/config'
import { isLowercaseEqual } from '@app/common/utils/lowercase_equal'

@Injectable()
export class TokenAddressMapper {
  constructor (private readonly configService: ConfigService) {}

  getTokenAddress (tokenAddress: string): string {
    const wrappedFuseAddress = this.configService.get('wfuseAddress')

    return get(
      {
        [NATIVE_FUSE_ADDRESS.toLowerCase()]: wrappedFuseAddress.toLowerCase()
      },
      tokenAddress.toLowerCase(),
      tokenAddress.toLowerCase()
    )
  }

  getOriginalTokenAddress (mappedTokenAddress: string): string {
    const wrappedFuseAddress = this.configService.get('wfuseAddress')

    if (isLowercaseEqual(mappedTokenAddress, wrappedFuseAddress)) {
      return NATIVE_FUSE_ADDRESS.toLowerCase()
    }

    return mappedTokenAddress.toLowerCase()
  }
}
