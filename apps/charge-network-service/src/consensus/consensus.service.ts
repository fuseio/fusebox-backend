import {
  HttpException,
  Injectable,
  Logger,
  Inject
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  Contract,
  InjectEthersProvider,
  Interface,
  JsonRpcProvider,
  formatEther,
  formatUnits
} from 'nestjs-ethers'
import { Cron, CronExpression, Timeout } from '@nestjs/schedule'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { isEmpty, isUndefined } from 'lodash'
import MultiCallAbi from '@app/network-service/common/constants/abi/MultiCall'
import ConsensusAbi from '@app/network-service/common/constants/abi/Consensus'
import { HttpService } from '@nestjs/axios'
import { catchError, lastValueFrom, map } from 'rxjs'
import { DelegatedAmountsDto } from '@app/network-service/consensus/dto/delegate.dto'
import { IValidator } from '@app/network-service/consensus/interfaces'
import { logPerformance } from '@app/notifications-service/common/decorators/log-performance.decorator'

interface CacheOptions<T> {
  cacheKey: string;
  volatility: 'high' | 'medium' | 'low';
  fetchFunction: () => Promise<T>;
  forceRefresh?: boolean;
  refreshCondition?: (cachedValue: T) => boolean;
}

@Injectable()
export class ConsensusService {
  private readonly logger = new Logger(ConsensusService.name)

  constructor (
    private readonly httpService: HttpService,
    @InjectEthersProvider('regular-node')
    private readonly provider: JsonRpcProvider,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleValidatorsUpdate () {
    const validatorsInfo = await this.getValidators()
    await this.cacheManager.set('validatorsInfo', validatorsInfo)

    return validatorsInfo
  }

  @Timeout(5000)
  async fetchValidatorsTimeout () {
    // Called once after 5 seconds
    await this.handleValidatorsUpdate()
  }

  private get multiCallAddress (): string {
    return this.configService.getOrThrow('multiCallAddress')
  }

  private get botApi (): string {
    return this.configService.getOrThrow('botApi')
  }

  private get consensusAddress (): string {
    return this.configService.getOrThrow('consensusAddress')
  }

  private get consensusInterface (): Interface {
    return new Interface(ConsensusAbi)
  }

  private get multiCallContract (): Contract {
    return new Contract(
      this.multiCallAddress,
      MultiCallAbi,
      this.provider
    )
  }

  async withdraw (validator: string, amount: string) {
    return this.createTransactionObject('withdraw', [validator, amount])
  }

  async delegate (validator: string) {
    return this.createTransactionObject('delegate', [validator])
  }

  async getCachedValidatorsInfo () {
    return this.getCacheOrFetch({
      cacheKey: 'validatorsInfo',
      volatility: 'medium',
      fetchFunction: () => this.handleValidatorsUpdate()
    })
  }

  @logPerformance('ConsensusService::GetValidators')
  private async getValidators () {
    const results = await Promise.all([
      this.readTotalStakeAmount(),
      this.readValidators(),
      this.readJailedValidators(),
      this.readMaxStake(),
      this.readMinStake(),
      this.readPendingValidators(),
      this.getTotalSupply()
    ])

    return this.formatConsensusResults(results)
  }

  private async formatConsensusResults (results: any[]) {
    const [
      totalStakeAmount,
      validators,
      jailedValidators,
      maxStake,
      minStake,
      pendingValidators,
      totalSupply
    ] = results

    const combinedValidators = [...validators, ...jailedValidators]
    const {
      totalDelegators,
      validatorsMetadata
    } = await this.getValidatorsMetadata(
      combinedValidators,
      pendingValidators,
      totalSupply,
      formatEther(totalStakeAmount)
    )

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
  private async getValidatorsMetadata (
    validators: string[],
    pendingValidators: string[],
    totalSupply: number,
    totalStakeAmount: string
  ) {
    const validatorDatas = await this.fetchValidatorDatas(validators)
    const validatorsMap = await this.fetchValidatorsMap()

    const validatorsMetadata = await Promise.all(
      validators.map((validator, index) =>
        this.buildValidatorMetadata(
          validator,
          validatorDatas[index],
          validatorsMap,
          pendingValidators,
          totalSupply,
          totalStakeAmount
        )
      )
    )

    const totalDelegators = validatorsMetadata.reduce(
      (sum, meta) => sum + parseInt(meta.delegatorsLength, 10),
      0
    )

    return {
      totalDelegators,
      pendingValidators,
      validatorsMetadata: this.mapValidatorsMetadata(validatorsMetadata)
    }
  }

  private async fetchValidatorDatas (
    validators: string[]
  ): Promise<Partial<IValidator>[]> {
    return Promise.all(
      validators.map(validator => this.getValidatorData(validator))
    )
  }

  private createBaseMetadata (
    validator: string,
    metadata: Partial<IValidator>,
    validatorsMap: Record<string, any>,
    pendingValidators: string[]
  ): IValidator {
    const validatorData = validatorsMap[validator.toLowerCase()] || {}

    return {
      ...metadata,
      address: validator,
      name: validatorData.name || validator,
      website: validatorData.website,
      image: validatorData.image,
      status: metadata.isJailed ? 'inactive' : 'active',
      isPending: pendingValidators.includes(validator.toLowerCase()),
      description: validatorData.description,
      stakeAmount: metadata.stakeAmount,
      fee: metadata.fee,
      delegatorsLength: metadata.delegatorsLength || '0',
      delegators: metadata.delegators,
      isJailed: metadata.isJailed
    }
  }

  private async buildValidatorMetadata (
    validator: string,
    metadata: Partial<IValidator>,
    validatorsMap: Record<string, any>,
    pendingValidators: string[],
    totalSupply: number,
    totalStakeAmount: string
  ): Promise<IValidator> {
    const baseMetadata = this.createBaseMetadata(
      validator,
      metadata,
      validatorsMap,
      pendingValidators
    )

    if (!metadata.isJailed) {
      try {
        const [nodeMetadata, apy] = await Promise.all([
          this.getNodeByAddress(validator),
          this.calculateEstimatedApy(
            validator,
            totalSupply,
            totalStakeAmount
          )
        ])

        return {
          ...baseMetadata,
          ...this.extendActiveMetadata(nodeMetadata),
          apy
        }
      } catch (error) {
        this.logger.error(`Error extending metadata for ${validator}: ${error}`)
      }
    }

    return baseMetadata
  }

  private extendActiveMetadata (nodeMetadata: any) {
    return {
      firstSeen: nodeMetadata?.firstSeen,
      forDelegation: nodeMetadata?.forDelegation,
      totalValidated: nodeMetadata?.totalValidated,
      uptime: nodeMetadata?.upTime
    }
  }

  private mapValidatorsMetadata (
    validatorsMetadata: IValidator[]
  ): Record<string, IValidator> {
    return validatorsMetadata.reduce((acc, obj) => {
      acc[obj.address] = obj
      return acc
    }, {})
  }

  @logPerformance('ConsensusService::CalculateEstimatedApy')
  private async calculateEstimatedApy (
    validator: string,
    totalSupply: number,
    totalStakeAmount: string
  ) {
    if (!validator) {
      return '0.0'
    }

    try {
      const fee = await this.getValidatorFee(validator)

      const totalStake = parseFloat(totalStakeAmount)
      const feePercentage = parseFloat(formatUnits(fee, 16)) / 100

      if (totalStake === 0) {
        return '0.0'
      }

      const reward = this.calculateReward(
        totalSupply,
        totalStake,
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

  @logPerformance('ConsensusService::GetValidatorFee')
  private async getValidatorFee (validator: string) {
    return this.getCacheOrFetch({
      cacheKey: `validatorFee-${validator}`,
      volatility: 'medium',
      fetchFunction: async () => {
        const [validatorFee] = await this.aggregateCalls([
          {
            method: 'validatorFee',
            params: [validator]
          }
        ])
        return validatorFee
      },
      refreshCondition: cachedValue => isUndefined(cachedValue)
    })
  }

  private async isJailed (validator: string): Promise<boolean> {
    return this.getCacheOrFetch({
      cacheKey: `isJailed-${validator}`,
      volatility: 'medium',
      fetchFunction: async () => {
        const [isJailed] = await this.aggregateCalls([
          {
            method: 'isJailed',
            params: [validator]
          }
        ])
        return isJailed
      },
      refreshCondition: cachedValue => isUndefined(cachedValue)
    })
  }

  @logPerformance('ConsensusService::ReadTotalStakeAmount')
  private async readTotalStakeAmount () {
    return this.getCacheOrFetch({
      cacheKey: 'totalStakeAmount',
      volatility: 'high',
      fetchFunction: async () => {
        const [totalStakeAmountResult] = await this.aggregateCalls([
          {
            method: 'totalStakeAmount',
            params: []
          }
        ])
        return totalStakeAmountResult
      }
    })
  }

  @logPerformance('ConsensusService::ReadValidators')
  private async readValidators () {
    return this.getCacheOrFetch({
      cacheKey: 'validators',
      volatility: 'medium',
      fetchFunction: async () => {
        const [validatorsResult] = await this.aggregateCalls([
          {
            method: 'getValidators',
            params: []
          }
        ])
        return validatorsResult
      }
    })
  }

  @logPerformance('ConsensusService::ReadJailedValidators')
  private async readJailedValidators () {
    return this.getCacheOrFetch({
      cacheKey: 'jailedValidators',
      volatility: 'medium',
      fetchFunction: async () => {
        const [jailedValidatorsResult] = await this.aggregateCalls([
          {
            method: 'jailedValidators',
            params: []
          }
        ])
        return jailedValidatorsResult
      }
    })
  }

  @logPerformance('ConsensusService::ReadMaxStake')
  private async readMaxStake () {
    return this.getCacheOrFetch({
      cacheKey: 'maxStake',
      volatility: 'low',
      fetchFunction: async () => {
        const [maxStakeResult] = await this.aggregateCalls([
          {
            method: 'getMaxStake',
            params: []
          }
        ])
        return maxStakeResult
      }
    })
  }

  @logPerformance('ConsensusService::ReadMinStake')
  private async readMinStake () {
    return this.getCacheOrFetch({
      cacheKey: 'minStake',
      volatility: 'low',
      fetchFunction: async () => {
        const [minStakeResult] = await this.aggregateCalls([
          {
            method: 'getMinStake',
            params: []
          }
        ])
        return minStakeResult
      }
    })
  }

  @logPerformance('ConsensusService::ReadPendingValidators')
  private async readPendingValidators () {
    return this.getCacheOrFetch({
      cacheKey: 'pendingValidators',
      volatility: 'low',
      fetchFunction: async () => {
        const [pendingValidatorsResult] = await this.aggregateCalls([
          {
            method: 'pendingValidators',
            params: []
          }
        ])
        return pendingValidatorsResult
      }
    })
  }

  private async readDelegators (validator: string) {
    return this.getCacheOrFetch({
      cacheKey: `delegators-${validator}`,
      volatility: 'medium',
      fetchFunction: async () => {
        const [delegatorsResult] = await this.aggregateCalls([
          {
            method: 'delegators',
            params: [validator]
          }
        ])
        return delegatorsResult
      }
    })
  }

  private async readStakeAmount (validator: string) {
    return this.getCacheOrFetch({
      cacheKey: `stakeAmount-${validator}`,
      volatility: 'medium',
      fetchFunction: async () => {
        const [stakeAmountResult] = await this.aggregateCalls([
          {
            method: 'stakeAmount',
            params: [validator]
          }
        ])
        return stakeAmountResult
      }
    })
  }

  @logPerformance('ConsensusService::GetValidatorData')
  private async getValidatorData (validatorAddress: string): Promise<Partial<IValidator>> {
    try {
      const [
        stakeAmount,
        validatorFee,
        delegatorsMap,
        isJailed
      ] = await Promise.all([
        this.readStakeAmount(validatorAddress),
        this.getValidatorFee(validatorAddress),
        this.readDelegators(validatorAddress),
        this.isJailed(validatorAddress)
      ])

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

  private async getNodeByAddress (nodeAddress: string) {
    return this.getCacheOrFetch({
      cacheKey: `nodeData-${nodeAddress}`,
      volatility: 'low',
      fetchFunction: async () => {
        const url = `${this.botApi}/node=${nodeAddress}`
        const { Node } = await this.httpProxyGet(url)
        return Node
      }
    })
  }

  @logPerformance('ConsensusService::GetTotalSupply')
  async getTotalSupply () {
    const url = `${this.botApi}/stats/total_supply_simple`
    return this.httpProxyGet(url)
  }

  private async httpProxyGet (url: string) {
    const maxRetries = 5 // Maximum retries
    let retryCount = 0
    let delay = 100 // Initial delay in milliseconds

    while (retryCount < maxRetries) {
      try {
        const responseData = await lastValueFrom(
          this.httpService.get(url).pipe(
            map(response => response.data),
            catchError(e => {
              throw new HttpException(
                `${e?.response?.statusText}: ${e?.response?.data?.error}`,
                e?.response?.status
              )
            })
          )
        )
        return responseData
      } catch (error) {
        if (retryCount === maxRetries - 1) throw error // Throw error on last retry
        await new Promise(resolve => setTimeout(resolve, delay))
        delay *= 2 // Exponential increase of the delay
        retryCount++
      }
    }
  }

  private cacheDuration (volatility: 'high' | 'medium' | 'low'): number {
    switch (volatility) {
      case 'high':
        return 1000 * 60 * 5 // 5 minutes
      case 'medium':
        return 1000 * 60 * 30 // 30 minutes
      case 'low':
        return 1000 * 60 * 60 * 24 // 24 hours
      default:
        return 1000 * 60 * 30 // Default to 30 minutes
    }
  }

  private encodeFunctionData (method: string, params: any[]): string {
    return this.consensusInterface.encodeFunctionData(method, params)
  }

  private createTransactionObject (method: string, params: any[]) {
    return {
      to: this.consensusAddress,
      data: this.encodeFunctionData(method, params)
    }
  }

  @logPerformance('ConsensusService::FetchValidatorsMap')
  private async fetchValidatorsMap () {
    return this.getCacheOrFetch({
      cacheKey: 'validatorsMap',
      volatility: 'low',
      fetchFunction: async () => {
        const url = 'https://raw.githubusercontent.com/fuseio/console-dapp/master/validators/validators.json'
        const responseData = await this.httpProxyGet(url)
        return Object.entries(responseData).reduce((acc, [key, value]) => {
          acc[key.toLowerCase()] = value
          return acc
        }, {})
      }
    })
  }

  private async getCacheOrFetch<T> ({
    cacheKey,
    volatility,
    fetchFunction,
    forceRefresh = false,
    refreshCondition
  }: CacheOptions<T>): Promise<T> {
    let cachedValue = await this.cacheManager.get<T>(cacheKey)

    const shouldRefresh = forceRefresh || (refreshCondition && refreshCondition(cachedValue))

    if (isEmpty(cachedValue) || shouldRefresh) {
      cachedValue = await fetchFunction()
      await this.cacheManager.set(cacheKey, cachedValue, this.cacheDuration(volatility))
    }

    return cachedValue
  }
}
