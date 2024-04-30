import { HttpException, Injectable, Logger, Inject } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  Contract,
  InjectEthersProvider,
  Interface,
  JsonRpcProvider,
  formatEther,
  formatUnits
} from 'nestjs-ethers'
import { Cron, CronExpression } from '@nestjs/schedule'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import MultiCallAbi from '@app/network-service/common/constants/abi/MultiCall'
import ConsensusAbi from '@app/network-service/common/constants/abi/Consensus'
import { HttpService } from '@nestjs/axios'
import { catchError, lastValueFrom, map } from 'rxjs'
import { DelegatedAmountsDto } from '@app/network-service/consensus/dto/consensus.dto'
import { IValidator } from '@app/network-service/consensus/interfaces'
import { logPerformance } from '@app/notifications-service/common/decorators/log-performance.decorator'

@Injectable()
export class ConsensusService {
  private readonly logger = new Logger(ConsensusService.name)
  constructor (
    private httpService: HttpService,
    @InjectEthersProvider('regular-node')
    private readonly provider: JsonRpcProvider,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) { }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleValidatorsUpdate () {
    const validatorsInfo = await this.getValidators()
    await this.cacheManager.set('validatorsInfo', validatorsInfo)

    return this.cacheManager.get('validatorsInfo')
  }

  get multiCallAddress () {
    return this.configService.getOrThrow('multiCallAddress')
  }

  get botApi () {
    return this.configService.getOrThrow('botApi')
  }

  get consensusAddress () {
    return this.configService.getOrThrow('consensusAddress')
  }

  get consensusInterface (): Interface {
    return new Interface(ConsensusAbi)
  }

  get multiCallContract () {
    return new Contract(
      this.multiCallAddress,
      MultiCallAbi,
      this.provider
    )
  }

  async withdraw (validator: string, amount: string) {
    return this.createTransactionObject(
      this.encodeFunctionData('withdraw', [validator, amount])
    )
  }

  async delegate (validator: string) {
    return this.createTransactionObject(
      this.encodeFunctionData('delegate', [validator])
    )
  }

  @logPerformance('ConsensusService::CalculateEstimatedApy')
  async calculateEstimatedApy (validator: string) {
    if (!validator) {
      return '0.0'
    }

    try {
      const [results, totalSupply] = await Promise.all([
        this.aggregateCalls([
          {
            method: 'totalStakeAmount',
            params: []
          },
          {
            method: 'validatorFee',
            params: [validator]
          }
        ]),
        this.getTotalSupply()
      ])

      const totalStakeAmount = parseFloat(formatEther(results[0]))
      const feePercentage = parseFloat(formatUnits(results[1], 16)) / 100

      if (totalStakeAmount === 0) {
        return '0.0'
      }

      const reward = this.calculateReward(
        totalSupply,
        totalStakeAmount,
        feePercentage
      )

      return reward.toFixed(1)
    } catch (error) {
      this.logger.error(`Error calculating APY for ${validator}: ${error}`)
      return '0.0'
    }
  }

  private calculateReward (
    totalSupply: number,
    totalStakeAmount: number,
    feePercentage: number
  ): number {
    const baseRewardRate = 0.05 // 5% base reward rate
    return (totalSupply / totalStakeAmount) * baseRewardRate * (1 - feePercentage) * 100
  }

  async getCachedValidatorsInfo () {
    const cachedInfo = await this.cacheManager.get('validatorsInfo')
    if (!cachedInfo) {
      return this.handleValidatorsUpdate()
    }

    return cachedInfo
  }

  @logPerformance('ConsensusService::GetValidators')
  async getValidators () {
    const validatorMethods = [
      'totalStakeAmount',
      'getValidators',
      'jailedValidators',
      'getMaxStake',
      'getMinStake'
    ]

    const [
      results,
      totalSupply
    ] = await Promise.all([
      this.aggregateCalls(
        validatorMethods
          .map(
            method => ({
              method,
              params: []
            })
          )
      ),
      this.getTotalSupply()
    ])

    const [
      totalStakeAmount,
      validators,
      jailedValidators,
      maxStake,
      minStake
    ] = results

    const combinedValidators = validators.concat(jailedValidators)
    const {
      totalDelegators,
      pendingValidators,
      validatorsMetadata
    } = await this.getValidatorsMetadata(combinedValidators)

    return {
      totalStakeAmount: formatEther(totalStakeAmount),
      totalSupply,
      maxStake: formatEther(maxStake),
      minStake: formatEther(minStake),
      totalDelegators,
      allValidators: combinedValidators,
      activeValidators: validators,
      jailedValidators,
      pendingValidators,
      validatorsMetadata
    }
  }

  @logPerformance('ConsensusService::GetValidatorsMetadata')
  async getValidatorsMetadata (validators: string[]) {
    const [
      pendingValidators
    ] = await this.aggregateCalls([
      {
        method: 'pendingValidators',
        params: []
      }
    ])

    const validatorDataPromises = validators.map((validator) =>
      this.getValidatorData(validator)
    )
    const validatorDatas: Partial<IValidator>[] = await Promise.all(
      validatorDataPromises
    )

    let totalDelegators = 0
    const validatorsMetadata: IValidator[] = await Promise.all(
      validators.map(async (validator, index) => {
        const metadata: Partial<IValidator> = validatorDatas[index]
        const validatorData = validators[validator.toLowerCase()]
        totalDelegators += parseInt(metadata.delegatorsLength, 10)

        const baseMetadata: IValidator = {
          address: validator,
          name: validatorData?.name || validator,
          website: validatorData?.website,
          image: validatorData?.image,
          status: metadata.isJailed ? 'inactive' : 'active',
          isPending: pendingValidators.includes(validator.toLowerCase()),
          description: validatorData?.description,
          stakeAmount: metadata.stakeAmount,
          fee: metadata.fee,
          delegatorsLength: metadata.delegatorsLength,
          delegators: metadata.delegators,
          isJailed: metadata.isJailed
        }

        if (!metadata.isJailed) {
          try {
            const [{ Node }, apy] = await Promise.all([
              this.getNodeByAddress(validator),
              this.calculateEstimatedApy(validator)
            ])

            return {
              ...baseMetadata,
              firstSeen: Node?.firstSeen,
              forDelegation: Node?.forDelegation,
              totalValidated: Node?.totalValidated,
              uptime: Node?.upTime,
              apy
            }
          } catch (error) {
            return baseMetadata
          }
        } else {
          return baseMetadata
        }
      })
    )

    return {
      totalDelegators,
      pendingValidators,
      validatorsMetadata: validatorsMetadata.reduce((acc, obj) => {
        acc[obj.address] = obj
        return acc
      }, {})
    }
  }

  @logPerformance('ConsensusService::GetValidatorData')
  async getValidatorData (validatorAddress: string): Promise<Partial<IValidator>> {
    try {
      const validatorDataMethods = [
        'stakeAmount',
        'validatorFee',
        'delegators',
        'isJailed'
      ]

      const results = await this.aggregateCalls(
        validatorDataMethods
          .map(
            method => ({
              method,
              params: [validatorAddress]
            })
          )
      )

      const [
        stakeAmount,
        validatorFee,
        delegatorsMap,
        isJailed
      ] = results

      const delegatedAmounts = await this.aggregateCalls(
        delegatorsMap
          .map(delegator => ({
            method: 'delegatedAmount',
            params: [delegator, validatorAddress]
          }))
      )

      const delegators = delegatorsMap.reduce((acc, delegator, index) => {
        acc[delegator] = {
          address: delegator,
          amount: delegatedAmounts[index].toString(),
          amountFormatted: formatEther(delegatedAmounts[index])
        }

        return acc
      }, {})

      return {
        stakeAmount: formatEther(stakeAmount),
        fee: formatUnits(validatorFee, 16),
        delegatorsLength: delegatorsMap.length.toString(),
        delegators,
        isJailed
      }
    } catch (error) {
      this.logger.error(`Error fetching validator data for ${validatorAddress}: ${error}`)
    }
  }

  async getDelegatedAmounts (delegatedAmountsDto: DelegatedAmountsDto) {
    const { validator, delegators } = delegatedAmountsDto
    const delegatedAmounts = await this.aggregateCalls(
      delegators
        .map(delegator => ({
          method: 'delegatedAmount',
          params: [delegator, validator]
        }))
    )

    const delegatedAmountsByDelegators = delegators.reduce((acc, delegator, index) => {
      acc[delegator] = {
        address: delegator,
        amountFormatted: formatEther(delegatedAmounts[index].toString()),
        amount: delegatedAmounts[index].toString()
      }
      return acc
    }, {})

    return {
      delegatedAmountsByDelegators
    }
  }

  private async aggregateCalls (calls: { method: string; params?: any[] }[]) {
    const encodedCalls = calls.map(({ method, params }) => [
      this.consensusAddress,
      this.consensusInterface.encodeFunctionData(method, params || [])
    ])
    const [, results] = await this.multiCallContract.aggregate(encodedCalls)
    return results.map((result, index) =>
      this.consensusInterface.decodeFunctionResult(calls[index].method, result)[0]
    )
  }

  async getNodeByAddress (nodeAddress: string) {
    const url = `${this.botApi}/node=${nodeAddress}`
    const responseData = await this.httpProxyGet(url)
    return responseData
  }

  @logPerformance('ConsensusService::GetTotalSupply')
  async getTotalSupply () {
    const url = `${this.botApi}/stats/total_supply_simple`
    const responseData = await this.httpProxyGet(url)
    return responseData
  }

  async httpProxyGet (url: string) {
    const responseData = await lastValueFrom(
      this.httpService.get(url)
        .pipe(
          map((response) => {
            return response.data
          })
        )
        .pipe(
          catchError(e => {
            throw new HttpException(
              `${e?.response?.statusText}: ${e?.response?.data?.error}`,
              e?.response?.status
            )
          })
        )
    )

    return responseData
  }

  private encodeFunctionData (method: string, params: any[]) {
    return this.consensusInterface.encodeFunctionData(method, params)
  }

  private createTransactionObject (encodedABI: string) {
    return {
      to: this.consensusAddress,
      data: encodedABI
    }
  }

  @logPerformance('ConsensusService::FetchValidatorsMap')
  async fetchValidatorsMap () {
    const url = 'https://raw.githubusercontent.com/fuseio/console-dapp/master/validators/validators.json'
    const responseData = await this.httpProxyGet(url)

    return Object.entries(responseData).reduce((acc, [key, value]) => {
      acc[key.toLowerCase()] = value
      return acc
    }, {})
  }
}
