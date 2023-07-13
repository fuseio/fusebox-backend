// import { CreateProjectDto } from '@app/accounts-service/projects/dto/create-project.dto'
import { PaymasterInfo } from '@app/accounts-service/paymaster/interfaces/paymaster.interface'
import { paymasterInfoModelString } from '@app/accounts-service/paymaster/paymaster.constants'
import { ProjectsService } from '@app/accounts-service/projects/projects.service'
import { apiService } from '@app/common/constants/microservices.constants'
import { Inject, Injectable } from '@nestjs/common'
import { ClientProxy, RpcException } from '@nestjs/microservices'
import { Model } from 'mongoose'
import { callMSFunction } from '@app/common/utils/client-proxy'
import base64url from 'base64url'
import * as crypto from 'crypto'

@Injectable()
export class PaymasterService {
  constructor(
    @Inject(apiService) private readonly apiClient: ClientProxy,
    @Inject(paymasterInfoModelString)
    private paymasterModel: Model<PaymasterInfo>,
    private projectsService: ProjectsService
  ) { }

  async create(projectId: string) {


    const exPaymasterInfo = await this.paymasterModel.findOne({
      projectId
    })
    if (exPaymasterInfo) {
      throw new RpcException('Paymaster Info already exist')
    }

    const paymasterInfo = {
      paymasterAddress: "0xb234cb63B4A016aDE53E900C667a3FC3C5Cc8F46",
      sponsorId: base64url(crypto.randomBytes(18))
    }

    const result = await this.paymasterModel.create({
      projectId,
      ...paymasterInfo
    })


  }
}
