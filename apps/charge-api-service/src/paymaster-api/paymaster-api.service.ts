import { accountsService } from '@app/common/constants/microservices.constants'
import { ClientProxy, RpcException } from '@nestjs/microservices'
import {
  Injectable,
  Inject,
  InternalServerErrorException
} from '@nestjs/common'
import { arrayify, defaultAbiCoder, hexConcat } from 'ethers/lib/utils'
import fusePaymasterABI from '@app/api-service/paymaster-api/abi/FuseVerifyingPaymasterSingleton.abi.json'

import { BigNumber, Wallet } from 'ethers'
import { ConfigService } from '@nestjs/config'
import PaymasterWeb3ProviderService from '@app/common/services/paymaster-web3-provider.service'
import { callMSFunction } from '@app/common/utils/client-proxy'
import { capitalize, isEmpty } from 'lodash'
import { HttpService } from '@nestjs/axios'
import { catchError, lastValueFrom, map } from 'rxjs'
import { AxiosRequestConfig, AxiosResponse } from 'axios'

@Injectable()
export class PaymasterApiService {
  constructor (
    @Inject(accountsService) private readonly accountClient: ClientProxy,
    private configService: ConfigService,
    private paymasterWeb3ProviderService: PaymasterWeb3ProviderService,
    private httpService: HttpService
  ) { }

  async pm_sponsorUserOperation (body: any, env: any, projectId: string) {
    try {
      const web3 = this.paymasterWeb3ProviderService.getProviderByEnv(env)
      const [op] = body
      const { timestamp } = await web3.eth.getBlock('latest')
      const validUntil = parseInt(timestamp.toString()) + 240
      const validAfter = 0
      const paymasterInfo = await callMSFunction(this.accountClient, 'get_paymaster_info', { projectId, env })
      const minVerificationGasLimit = '140000'

      if (isEmpty(paymasterInfo)) {
        throw new RpcException(`Error getting paymaster for project: ${projectId} in ${env} environment`)
      }

      const sponsorId = paymasterInfo.sponsorId

      const {
        preVerificationGas,
        verificationGasLimit,
        callGasLimit
      } = await this.estimateUserOpGas(
        op,
        env,
        paymasterInfo.entrypointAddress
      )
      const actualVerificationGasLimit = Math.max(parseInt(verificationGasLimit), parseInt(minVerificationGasLimit)).toString()

      op.callGasLimit = op.callGasLimit ? op.callGasLimit : callGasLimit
      op.verificationGasLimit = actualVerificationGasLimit
      op.preVerificationGas = op.preVerificationGas ? op.preVerificationGas : preVerificationGas

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

  async estimateUserOpGas (op, requestEnvironment, entrypointAddress) {
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
              e?.response?.data?.error ||
              e?.response?.data?.errors?.message ||
              ''

            throw new RpcException(errorReason)
          })
        )
    )
    console.log('Values from estimateUserOpGas func')
    console.log(response)
    const { result } = response

    const callGasLimit = BigNumber.from(result.callGasLimit).mul(115).div(100).toHexString() // 15% buffer

    return {
      ...response.result,
      callGasLimit
    }
  }

  private prepareUrl (environment) {
    if (isEmpty(environment)) throw new InternalServerErrorException('Bundler environment is missing')
    const config = this.configService.get(`bundler.${environment}`)

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
}
