import { PaymasterInfo } from '@app/accounts-service/paymaster/interfaces/paymaster.interface'
import { paymasterInfoModelString } from '@app/accounts-service/paymaster/paymaster.constants'
import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common'
import { Model } from 'mongoose'
import { ConfigService } from '@nestjs/config'
import { BigNumber } from 'ethers'

@Injectable()
export class PaymasterService {
  constructor (
    @Inject(paymasterInfoModelString)
    private paymasterModel: Model<PaymasterInfo>,
    private configService: ConfigService

  ) { }

  async create (projectId: string, ver: string) {
    if (!Object.keys(this.configService.getOrThrow(
      'paymaster')).includes(ver)) {
      throw new InternalServerErrorException('Paymaster version is wrong')
    }

    const paymasterEnvs = this.configService.getOrThrow(
      `paymaster.${ver}`
    )
    // TODO: When we will implement creation of new paymaster version
    // we should make the "isActive" field true on creation and make this field false for old paymaster info
    try {
      const sponsorId = this.getSponsorId(projectId)
      const paymasterDefaultObj = {
        paymasterVersion: ver,
        projectId,
        sponsorId,
        isActive: true
      }
      const productionPaymasterInfoObj = {
        ...paymasterDefaultObj,
        paymasterAddress: paymasterEnvs.production.paymasterContractAddress,
        entrypointAddress: paymasterEnvs.production.entrypointAddress,
        environment: 'production'
      }
      const sandboxPaymasterInfoObj = {
        ...paymasterDefaultObj,
        paymasterAddress: paymasterEnvs.sandbox.paymasterContractAddress,
        entrypointAddress: paymasterEnvs.sandbox.entrypointAddress,
        environment: 'sandbox'
      }
      return this.paymasterModel.create([productionPaymasterInfoObj, sandboxPaymasterInfoObj])
    } catch (err) {
      throw new InternalServerErrorException(err.message)
    }
  }

  async findOneByProjectIdAndEnv (idAndEnv: any) {
    return await this.paymasterModel.findOne({
      projectId: idAndEnv.projectId,
      isActive: true,
      environment: idAndEnv.env
    })
  }

  async findAll (projectId: string) {
    return await this.paymasterModel.find({
      projectId
    })
  }

  async findActivePaymasters (projectId: string) {
    return await this.paymasterModel.find({
      projectId, isActive: true
    })
  }

  async getAvailableVersionList () {
    return await Object.keys(this.configService.getOrThrow(
      'paymaster'))
  }

  getSponsorId (projectId: string) {
    return BigNumber.from(`0x${projectId}`).toString()
  }
}
