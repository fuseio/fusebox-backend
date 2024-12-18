import { accountsService } from '@app/common/constants/microservices.constants'
import { ClientProxy, RpcException } from '@nestjs/microservices'
import {
  Injectable,
  Inject,
  InternalServerErrorException,
  Logger
} from '@nestjs/common'
import { arrayify, defaultAbiCoder, hexConcat } from 'ethers/lib/utils'
import fusePaymasterABI from '@app/api-service/paymaster-api/abi/FuseVerifyingPaymasterSingleton.abi.json'
import { BigNumber, Contract, Wallet } from 'ethers'
import { ConfigService } from '@nestjs/config'
import { InjectEthersProvider, JsonRpcProvider } from 'nestjs-ethers'
import { callMSFunction } from '@app/common/utils/client-proxy'
import { capitalize, isEmpty, has, get } from 'lodash'
import { HttpService } from '@nestjs/axios'
import { catchError, lastValueFrom, map } from 'rxjs'
import { AxiosRequestConfig, AxiosResponse } from 'axios'

interface GasDetails {
  preVerificationGas: string;
  verificationGasLimit: string;
  verificationGas: string;
  validUntil: string;
  callGasLimit: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
}

@Injectable()
export class PaymasterApiService {
  private readonly logger = new Logger(PaymasterApiService.name)
  constructor (
    @Inject(accountsService) private readonly accountClient: ClientProxy,
    private configService: ConfigService,
    @InjectEthersProvider('fuse')
    private readonly fuseProvider: JsonRpcProvider,
    @InjectEthersProvider('fuseSpark')
    private readonly sparkProvider: JsonRpcProvider,
    private httpService: HttpService
  ) { }

  async pm_sponsorUserOperation (body: any, env: any, projectId: string) {
    try {
      const provider = this.getProviderByEnv(env)
      const [op] = body
      this.logger.log(`INITIAL OP: ${JSON.stringify(op)}`)
      const { timestamp } = await provider.getBlock('latest')

      const validUntil = parseInt(timestamp.toString()) + 900
      const validAfter = 0
      const paymasterInfo = await callMSFunction(this.accountClient, 'get_paymaster_info', { projectId, env })
      const minVerificationGasLimit = '140000'

      if (isEmpty(paymasterInfo)) {
        throw new RpcException(`Error getting paymaster for project: ${projectId} in ${env} environment`)
      }

      const sponsorId = paymasterInfo.sponsorId
      const paymasterAddress = paymasterInfo.paymasterAddress
      const paymasterContract = new Contract(
        paymasterAddress,
        fusePaymasterABI,
        provider
      )

      const hashForEstimateUserOpGasCall = await this.getHash(paymasterContract, op, validUntil, validAfter, sponsorId)
      const signatureForEstimateUserOpGasCall = await this.signHash(hashForEstimateUserOpGasCall, paymasterInfo)
      const paymasterAndDataForEstimateUserOpGasCall = this.buildPaymasterAndData(paymasterAddress, validUntil, validAfter, sponsorId, signatureForEstimateUserOpGasCall)

      op.paymasterAndData = paymasterAndDataForEstimateUserOpGasCall

      const gases: GasDetails = await this.estimateUserOpGas(op, env, paymasterInfo.entrypointAddress)

      const actualVerificationGasLimit = Math.max(parseInt(gases.verificationGasLimit), parseInt(minVerificationGasLimit)).toString()

      op.callGasLimit = gases?.callGasLimit ?? op.callGasLimit
      op.verificationGasLimit = actualVerificationGasLimit
      op.preVerificationGas = gases?.preVerificationGas

      const hash = await this.getHash(paymasterContract, op, validUntil, validAfter, sponsorId)
      const signature = await this.signHash(hash, paymasterInfo)
      const paymasterAndData = this.buildPaymasterAndData(paymasterAddress, validUntil, validAfter, sponsorId, signature)
      op.paymasterAndData = paymasterAndData

      const response = {
        paymasterAndData,
        preVerificationGas: op.preVerificationGas,
        verificationGasLimit: op.verificationGasLimit,
        callGasLimit: op.callGasLimit
      }
      this.logger.log(`Paymaster pm_sponsorUserOperation response ${JSON.stringify(response)}`)
      return response
    } catch (error) {
      this.logger.error(`Paymaster pm_sponsorUserOperation error ${JSON.stringify(error)}`)
      throw new RpcException(error)
    }
  }

  private async getHash (
    paymasterContract: Contract,
    op: any,
    validUntil: number,
    validAfter: number,
    sponsorId: string
  ) {
    return await paymasterContract.getHash(
      op,
      validUntil,
      validAfter,
      sponsorId
    )
  }

  private async signHash (hash: string, paymasterInfo: any) {
    const privateKeyString = this.configService.getOrThrow(
      `paymasterApi.keys.${paymasterInfo.paymasterVersion}.${paymasterInfo.environment}PrivateKey`
    )
    const paymasterSigner = new Wallet(privateKeyString)
    return await paymasterSigner.signMessage(arrayify(hash))
  }

  private buildPaymasterAndData (paymasterAddress: string, validUntil: number, validAfter: number, sponsorId: string, signature: string) {
    return hexConcat([
      paymasterAddress,
      defaultAbiCoder.encode(
        ['uint48', 'uint48', 'uint256', 'bytes'],
        [validUntil, validAfter, sponsorId, signature]
      ),
      signature
    ])
  }

  async estimateUserOpGas (op, requestEnvironment, entrypointAddress): Promise<GasDetails> {
    const data = {
      jsonrpc: '2.0',
      method: 'eth_estimateUserOperationGas',
      params: [
        op,
        entrypointAddress
      ],
      id: 1
    }

    const requestConfig: AxiosRequestConfig = {
      url: this.prepareUrl(requestEnvironment),
      method: 'post',
      data
    }

    const response = await lastValueFrom(
      this.httpService
        .request(requestConfig)
        .pipe(
          map((axiosResponse: AxiosResponse) => {
            return axiosResponse.data
          })
        )
        .pipe(
          catchError((e) => {
            const errorReason =
              e?.result?.error ||
              e?.result?.error?.message ||
              ''

            this.logger.error(`RpcException catchError: ${errorReason} ${JSON.stringify(e)}`)
            throw new RpcException(errorReason)
          })
        )
    )

    if (has(response, 'error')) {
      const error = get(response, 'error')
      this.logger.error('Error getting gas estimation', error)
      throw new RpcException(error)
    }

    if (!has(response, 'result')) {
      this.logger.error('Response does not contain result', JSON.stringify(response))
      throw new InternalServerErrorException('Error getting gas estimation from paymaster')
    }

    if (has(response, 'result.error')) {
      const result = get(response, 'result')
      const error = get(response, 'result.error')
      this.logger.error('Error in result of gas estimation', result)
      throw new RpcException(error)
    }

    if (!has(response, 'result.callGasLimit')) {
      const result = get(response, 'result')
      this.logger.error('Result does not contain callGasLimit', result)
      throw new InternalServerErrorException('Error getting gas estimation from paymaster')
    }

    const result = get(response, 'result') as GasDetails
    this.logger.log(`Gas estimation received: ${JSON.stringify(result)}`)

    const callGasLimit = BigNumber.from(result.callGasLimit).mul(115).div(100).toHexString() // 15% buffer

    return {
      ...result,
      callGasLimit
    }
  }

  private prepareUrl (environment) {
    if (isEmpty(environment)) throw new InternalServerErrorException('Bundler environment is missing')
    const config = this.configService.get(`bundler.${environment}.v0`)

    if (config.url) {
      return config.url
    } else {
      throw new InternalServerErrorException(`${capitalize(environment)} bundler environment is missing`)
    }
  }

  async pm_accounts (body, env: any, projectId: string) {
    // const [entryPointAddress] = body
    const paymasterInfo = await callMSFunction(this.accountClient, 'get_paymaster_info', { projectId, env })
    return [
      paymasterInfo.paymasterAddress
    ]
  }

  private getProviderByEnv (env: string) {
    if (env === 'production') {
      return this.fuseProvider
    }
    if (env === 'sandbox') {
      return this.sparkProvider
    }
  }
}
