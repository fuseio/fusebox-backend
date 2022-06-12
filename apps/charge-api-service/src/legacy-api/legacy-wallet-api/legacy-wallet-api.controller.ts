import { Controller, Get, Post } from '@nestjs/common'

@Controller({ path: 'v0/wallets/*' })
export class LegacyWalletApiController {
    @Get()
  getAny () {
    console.log('Getting any from wallets/*')
  }

    @Post()
    postAny () {
      console.log('Posting any from wallets/*')
    }
}
