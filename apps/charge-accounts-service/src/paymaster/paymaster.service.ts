import { PaymasterInfo } from '@app/accounts-service/paymaster/interfaces/paymaster.interface'
import { paymasterInfoModelString } from '@app/accounts-service/paymaster/paymaster.constants'
import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'
import { Model } from 'mongoose'
import * as crypto from 'crypto'
import { isEmpty } from 'lodash'

@Injectable()
export class PaymasterService {
  constructor(
    @Inject(paymasterInfoModelString)
    private paymasterModel: Model<PaymasterInfo>,
  ) { }

  async create(projectId: string) {
    try {
      const exPaymasterInfo = await this.paymasterModel.findOne({
        projectId
      })
      if (exPaymasterInfo) {
        throw new RpcException('Paymaster Info already exist')
      }
      const sponsorId = await this.generateUniqueSponsorId(crypto.randomBytes(18).toString('hex'))
      //We can do an endpoint in the Paymaster RPC Service for fetching this data 
      const paymasterInfo = {
        paymasterAddress: "0xb234cb63B4A016aDE53E900C667a3FC3C5Cc8F46",
        paymasterVersion: '0.1.0',
        entrypointAddress: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
        projectId,
        sponsorId,
        isActive: true
      }
      const result = await this.paymasterModel.create({
        ...paymasterInfo
      })
      if (result) return `Your sponsor Id is: ${sponsorId}`

    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }

  }

  async findOne(projectId: string) {
    return await this.paymasterModel.findOne({
      projectId
    })
  }


  private generateUniqueSponsorId = async (sponsorId) => {
    const exSponsorId = await this.paymasterModel.findOne({
      sponsorId
    })
    if (!isEmpty(exSponsorId)) {
      sponsorId = crypto.randomBytes(18).toString('hex');
      this.generateUniqueSponsorId(sponsorId)
    }
    return sponsorId
  }
}


