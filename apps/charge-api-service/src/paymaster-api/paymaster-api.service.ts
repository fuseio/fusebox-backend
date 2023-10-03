import { accountsService } from '@app/common/constants/microservices.constants'
import { ClientProxy, RpcException } from '@nestjs/microservices'
import {
  Injectable,
  Inject
} from '@nestjs/common'
import { arrayify, defaultAbiCoder, hexConcat } from 'ethers/lib/utils'
import fusePaymasterABI from '@app/api-service/paymaster-api/abi/FuseVerifyingPaymasterSingleton.abi.json'

import { BigNumber, Wallet } from 'ethers'
import { ConfigService } from '@nestjs/config'
import PaymasterWeb3ProviderService from '@app/common/services/paymaster-web3-provider.service'
import { callMSFunction } from '@app/common/utils/client-proxy'
import { isEmpty } from 'lodash'
import { UserOpParser } from '@app/common/services/user-op-parser.service'

@Injectable()
export class PaymasterApiService {
  constructor (
    @Inject(accountsService) private readonly accountClient: ClientProxy,
    private configService: ConfigService,
    private paymasterWeb3ProviderService: PaymasterWeb3ProviderService,
    private userOpParser: UserOpParser
  ) { }

  async pm_sponsorUserOperation (body: any, env: any, projectId: string) {
    try {
      const web3 = this.paymasterWeb3ProviderService.getProviderByEnv(env)
      const [op] = body
      const { timestamp } = await web3.eth.getBlock('latest')
      const validUntil = parseInt(timestamp.toString()) + 240
      const validAfter = 0
      const paymasterInfo = await callMSFunction(this.accountClient, 'get_paymaster_info', { projectId, env })

      if (isEmpty(paymasterInfo)) {
        throw new RpcException(`Error getting paymaster for project: ${projectId} in ${env} environment`)
      }

      const sponsorId = paymasterInfo.sponsorId

      const {
        preVerificationGas,
        verificationGasLimit,
        callGasLimit
      } = await this.estimateUserOpGas(web3, op)

      op.callGasLimit = callGasLimit
      op.verificationGasLimit = verificationGasLimit
      op.preVerificationGas = preVerificationGas

      const paymasterAddress = paymasterInfo.paymasterAddress
      const paymasterContract: any = new web3.eth.Contract(
        fusePaymasterABI as any,
        paymasterAddress
      )

      const hash = await paymasterContract.methods
        .getHash(op, validUntil, validAfter, sponsorId)
        .call()

      const privateKeyString = this.configService.getOrThrow(
        `paymasterApi.keys.${paymasterInfo.paymasterVersion}.${paymasterInfo.environment}PrivateKey`
      )

      const paymasterSigner = new Wallet(privateKeyString)
      const signature = await paymasterSigner.signMessage(arrayify(hash))

      const paymasterAndData = hexConcat([
        paymasterAddress,
        defaultAbiCoder.encode(
          ['uint48', 'uint48', 'uint256', 'bytes'],
          [validUntil, validAfter, sponsorId, signature]
        ),
        signature
      ])

      return {
        paymasterAndData,
        preVerificationGas: op.preVerificationGas,
        verificationGasLimit: op.verificationGasLimit,
        callGasLimit: op.callGasLimit
      }
    } catch (error) {
      throw new RpcException(error.message)
    }
  }

  async estimateUserOpGas (web3: any, op: any) {
    const { callData, sender } = op
    const preVerificationGas = BigNumber.from(op.preVerificationGas).toHexString()
    const verificationGasLimit = BigNumber.from(op.verificationGasLimit).toHexString()
    let callGasLimit

    const { calls } = await this.userOpParser.parseCallData(callData)

    for (const { targetAddress, value, data } of calls) {
      const innerCallGas = await web3.eth.estimateGas({
        to: targetAddress,
        data,
        value,
        from: sender
      })
      callGasLimit = BigNumber.from(op.callGasLimit).add(innerCallGas).toHexString()
    }

    callGasLimit = BigNumber.from(callGasLimit).mul(15).toHexString() // add 15% to the call gas limit

    return {
      preVerificationGas,
      verificationGasLimit,
      callGasLimit
    }
  }

  async pm_accounts (body, env: any, projectId: string) {
    // const [entryPointAddress] = body
    const paymasterInfo = await callMSFunction(this.accountClient, 'get_paymaster_info', { projectId, env })
    return [
      paymasterInfo.paymasterAddress
    ]
  }
}
