import { Controller, UseGuards, Req, Post, Res } from '@nestjs/common'
import { PaymasterApiServiceV0 } from '@app/api-service/paymaster-api/services/paymaster-api-v0.service'
import { IsPrdOrSbxKeyGuard } from '@app/api-service/api-keys/guards/is-production-or-sandbox-key.guard'
import { JSONRPCServer } from 'json-rpc-2.0'
import { ApiOperation, ApiTags, ApiBody, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiQuery } from '@nestjs/swagger'

@ApiTags('Paymaster JSON-RPC API')
@UseGuards(IsPrdOrSbxKeyGuard)
@Controller({ path: 'paymaster', version: '0' })
export class PaymasterApiController {
  server: JSONRPCServer = new JSONRPCServer()
  constructor (
    private readonly paymasterService: PaymasterApiServiceV0
  ) {
    this.server.addMethod('pm_sponsorUserOperation', (body, req: any) =>
      this.paymasterService.pm_sponsorUserOperation(
        body,
        req.environment,
        req.projectId
      )
    )
    this.server.addMethod('pm_accounts', (body, req: any) =>
      this.paymasterService.pm_accounts(
        body,
        req.environment,
        req.projectId
      )
    )
  }

  @Post()
  @ApiOperation({ summary: 'JSON-RPC API' })
  @ApiQuery({ name: 'apiKey', type: String, required: true, description: 'Your API key to authenticate requests.' })
  @ApiBody({
    description: 'JSON-RPC Request',
    type: Object,
    examples: {
      pm_sponsorUserOperation: {
        summary: 'Sponsor a user operation - Returns paymasterAndData and updated gas values',
        description: 'This methods sends a UserOperation to a paymaster for off-chain verification. If approved, it will return the paymasterAndData and updated gas values which can be appended to the UserOperation before signing.',
        value: {
          jsonrpc: '2.0',
          id: 1,
          method: 'pm_sponsorUserOperation',
          params: [
            {
              sender: '0x', // address
              nonce: '0x', // uint256
              initCode: '0x', // bytes
              callData: '0x', // bytes
              callGasLimit: '0x', // uint256
              verificationGasLimit: '0x', // uint256
              preVerificationGas: '0x', // uint256
              maxFeePerGas: '0x', // uint256
              maxPriorityFeePerGas: '0x', // uint256
              paymasterAndData: '0x', // bytes
              signature: '0x' // Can be a valid dummy value
            },
            '0x'
          ]
        }
      },
      pm_accounts: {
        summary: 'Get all paymaster addresses associated with an EntryPoint',
        description: 'This method allows clients to get all the paymaster addresses associated with an EntryPoint that\'s owned by this service. The first address in the returned array is the preferred paymaster contract.',
        value: {
          jsonrpc: '2.0',
          id: 1,
          method: 'pm_accounts',
          params: [
            'entryPoint' // string
          ]
        }
      }
    }
  })
  @ApiCreatedResponse({ description: 'JSON-RPC Response', type: Object })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async jsonRpc (@Req() req, @Res() res) {
    try {
      const jsonRPCRequest = req.body
      const jsonRPCResponse = await this.server.receive(jsonRPCRequest, req)
      if (jsonRPCResponse) {
        res.json(jsonRPCResponse)
      } else {
        res.sendStatus(204)
      }
    } catch (error) {
      // Handle error here
      console.error(error)
      res.status(500).send('An error occurred')
    }
  }
}
