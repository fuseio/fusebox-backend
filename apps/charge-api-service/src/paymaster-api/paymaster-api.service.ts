import { accountsService } from '@app/common/constants/microservices.constants'
import { ClientProxy } from '@nestjs/microservices'
import { callMSFunction } from '@app/common/utils/client-proxy'
import {
  Injectable,
  Inject
} from '@nestjs/common'
import { arrayify, defaultAbiCoder, hexConcat } from 'ethers/lib/utils'
import paymasterABI from './abi/EtherspotPaymaster.abi.json' // EtherspotPaymaster ABI
import { Wallet } from 'ethers'
import { ConfigService } from '@nestjs/config'
import Web3ProviderService from '@app/common/services/web3-provider.service'

@Injectable()
export class PaymasterApiService {
  constructor (
    @Inject(accountsService) private readonly accountClient: ClientProxy,
    private configService: ConfigService,
    private web3ProviderService: Web3ProviderService
  ) { }

  async getPaymasterData (context: any) {
    const projectId = context.projectId.toString()
    const paymasterInfo = await callMSFunction(this.accountClient, 'get_paymaster_info', projectId)

    return paymasterInfo
  }

  async pm_sponsorUserOperation (body: any) {
    const web3 = this.web3ProviderService.getProvider()
    const [op] = body
    const { timestamp } = await web3.eth.getBlock('latest')
    const validUntil = parseInt(timestamp.toString()) + 240
    const validAfter = 0

    // When the initCode is not empty, we need to increase the gas values. Multiplying everything by 3 seems to work, but we
    // need to have a better approach to estimate gas and update accordingly.
    if (op.initCode !== '0x') {
      op.preVerificationGas = op.preVerificationGas * 3
      op.verificationGasLimit = op.verificationGasLimit * 3
      op.callGasLimit = op.callGasLimit * 3
    }

    const paymasterAddress = this.configService.getOrThrow(
      'PAYMASTER_CONTRACT_ADDRESS'
    )
    console.log(paymasterAddress)

    const paymasterContract: any = new web3.eth.Contract(
      paymasterABI as any,
      paymasterAddress
    )

    // TODO: Add a check if the sender account address is whitelisted for the paymaster account
    // TODO: we need to figure out whether the gases needs to be update. If so, they needs to be updated prior signing calling `getHash` on the paymaster
    // op.verificationGasLimit = BigNumber.from(400000).toHexString();
    // op.preVerificationGas = BigNumber.from(150000).toHexString();
    // op.callGasLimit = BigNumber.from(150000).toHexString();
    const hash = await paymasterContract.methods
      .getHash(op, validUntil, validAfter)
      .call()

    const privateKeyString = this.configService.getOrThrow(
      'PAYMASTER_SIGNER_PRIVATE_KEY'
    )
    const paymasterSigner = new Wallet(privateKeyString)
    const signature = await paymasterSigner.signMessage(arrayify(hash))

    const validUntilHex = web3.utils.numberToHex(validUntil)
    const validAfterHex = web3.utils.numberToHex(validAfter)

    const paymasterAndData = hexConcat([
      paymasterAddress,
      defaultAbiCoder.encode(
        ['uint48', 'uint48'],
        [validUntilHex, validAfterHex]
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
}
