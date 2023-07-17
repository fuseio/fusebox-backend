import { Controller, Get, Post, Req, Res } from '@nestjs/common'
import { AppService } from './app.service'
import { JSONRPCServer } from 'json-rpc-2.0'
import { pm_sponsorUserOperation } from './methods/pm_sponsorUserOperation'
import { Web3ProviderService } from './web3-provider/web3-provider.service'
import { ConfigService } from '@nestjs/config'

@Controller()
export class AppController {
  server: JSONRPCServer = new JSONRPCServer()
  constructor(
    private readonly configService: ConfigService,
    private readonly appService: AppService,
    private readonly web3ProviderService: Web3ProviderService
  ) {
    this.server.addMethod('pm_sponsorUserOperation', (body) =>
      pm_sponsorUserOperation(
        body,
        this.web3ProviderService.getProvider(),
        configService
      )

    )
  }

  @Get()
  getHello(): string {
    return this.appService.getHello()
  }

  @Post('json-rpc')
  jsonRpc(@Req() req, @Res() res) {
    const jsonRPCRequest = req.body
    console.log(this.server)

    // server.receive takes a JSON-RPC request and returns a promise of a JSON-RPC response.
    // It can also receive an array of requests, in which case it may return an array of responses.
    // Alternatively, you can use server.receiveJSON, which takes JSON string as is (in this case req.body).
    this.server.receive(jsonRPCRequest).then((jsonRPCResponse) => {
      if (jsonRPCResponse) {
        res.json(jsonRPCResponse)
      } else {
        res.sendStatus(204)
      }
    })
  }
}
