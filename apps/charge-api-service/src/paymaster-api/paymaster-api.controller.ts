import { Controller, Get, UseGuards, Req, Post, Res } from '@nestjs/common'
import { PaymasterApiService } from '@app/api-service/paymaster-api/paymaster-api.service'
import { PublicApiKeyToProjectIdGuard } from '@app/api-service/api-keys/guards/public-api-key-to-project-id.guard'
import { JSONRPCServer } from 'json-rpc-2.0';
import { ConfigService } from '@nestjs/config';

@UseGuards(PublicApiKeyToProjectIdGuard)
@Controller({ path: 'v1/paymaster' })
export class PaymasterApiController {
  server: JSONRPCServer = new JSONRPCServer();
  constructor(
    private readonly paymasterService: PaymasterApiService,
  ) {
    this.server.addMethod('pm_sponsorUserOperation', (body) =>
      this.paymasterService.pm_sponsorUserOperation(
        body
      ),
    );
  }

  @Post()
  jsonRpc(@Req() req, @Res() res) {
    const jsonRPCRequest = req.body;
    console.log(req.projectId);

    // server.receive takes a JSON-RPC request and returns a promise of a JSON-RPC response.
    // It can also receive an array of requests, in which case it may return an array of responses.
    // Alternatively, you can use server.receiveJSON, which takes JSON string as is (in this case req.body).
    this.server.receive(jsonRPCRequest).then((jsonRPCResponse) => {
      if (jsonRPCResponse) {
        res.json(jsonRPCResponse);
      } else {
        res.sendStatus(204);
      }
    });
  }
}
