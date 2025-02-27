import { Controller, UseGuards, Req, Post, Res, Body } from '@nestjs/common'
import { PaymasterApiService } from '@app/api-service/paymaster-api/paymaster-api.service'
import { IsPrdOrSbxKeyGuard } from '@app/api-service/api-keys/guards/is-production-or-sandbox-key.guard'
import { JSONRPCServer } from 'json-rpc-2.0'
import { ApiOperation, ApiTags, ApiBody, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiQuery } from '@nestjs/swagger'

@ApiTags('Paymaster JSON-RPC API')
@Controller({ path: 'v0/paymaster' })
export class PaymasterApiController {
  server: JSONRPCServer = new JSONRPCServer()
  constructor (
    private readonly paymasterService: PaymasterApiService
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

  @Post('/estimate-gas')
  @ApiOperation({ summary: 'Estimate gas for user operations' })
  @ApiBody({
    description: 'Gas Estimation Request',
    type: Object,
    examples: {
      estimateGas: {
        summary: 'Estimate gas for a user operation',
        value: {
          userOp: {
            sender: '0x1234567890123456789012345678901234567890',
            nonce: '0x1',
            initCode: '0x',
            callData: '0xa9059cbb000000000000000000000000abcdef0123456789abcdef0123456789abcdef010000000000000000000000000000000000000000000000000de0b6b3a7640000',
            callGasLimit: '0x30000',
            verificationGasLimit: '0x100000',
            preVerificationGas: '0x20000',
            maxFeePerGas: '0x3b9aca00',
            maxPriorityFeePerGas: '0x3b9aca00',
            paymasterAndData: '0x2345678901234567890123456789012345678901000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
            signature: '0x1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890'
          },
          entrypointAddress: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
          environment: 'sandbox'
        }
      }
    }
  })
  @ApiCreatedResponse({ description: 'Gas estimation results', type: Object })
  @ApiInternalServerErrorResponse({ description: 'Error estimating gas' })
  async estimateGas (@Body() body: {
    userOp: any,
    entrypointAddress: string,
    environment?: string
  }) {
    const environment = body.environment || 'sandbox'

    return this.paymasterService.estimateUserOpGas(
      body.userOp,
      environment,
      body.entrypointAddress
    )
  }
}
