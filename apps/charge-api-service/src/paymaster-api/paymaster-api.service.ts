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

@Injectable()
export class PaymasterApiService {
  constructor (
    @Inject(accountsService) private readonly accountClient: ClientProxy,
    private configService: ConfigService,
    private paymasterWeb3ProviderService: PaymasterWeb3ProviderService
  ) { }

  async pm_sponsorUserOperation (body: any, env: any, projectId: string) {
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

    // When the initCode is not empty, we need to increase the gas values. Multiplying everything by 3 seems to work, but we
    // need to have a better approach to estimate gas and update accordingly.
    // if (op.initCode !== '0x') {
    op.preVerificationGas = BigNumber.from(op.preVerificationGas).mul(10).toHexString()
    op.verificationGasLimit = BigNumber.from(op.verificationGasLimit).mul(10).toHexString()
    op.callGasLimit = BigNumber.from(op.callGasLimit).mul(10).toHexString()
    // }
    const paymasterAddress = paymasterInfo.paymasterAddress
    const paymasterContract: any = new web3.eth.Contract(
      fusePaymasterABI as any,
      paymasterAddress
    )

    // TODO: Add a check if the sender account address is whitelisted for the paymaster account
    // TODO: we need to figure out whether the gases needs to be update. If so, they needs to be updated prior signing calling `getHash` on the paymaster
    // op.verificationGasLimit = BigNumber.from(400000).toHexString();
    // op.preVerificationGas = BigNumber.from(150000).toHexString();
    // op.callGasLimit = BigNumber.from(150000).toHexString();
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
  }

  async pm_accounts (body, env: any, projectId: string) {
    // const [entryPointAddress] = body
    const paymasterInfo = await callMSFunction(this.accountClient, 'get_paymaster_info', { projectId, env })
    return [
      paymasterInfo.paymasterAddress
    ]
  }
}
