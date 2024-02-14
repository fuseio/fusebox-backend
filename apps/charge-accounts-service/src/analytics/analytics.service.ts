import { Inject, Injectable } from '@nestjs/common'
import { init, track } from '@amplitude/analytics-node'
import { UsersService } from '@app/accounts-service/users/users.service'
import { ProjectsService } from '@app/accounts-service/projects/projects.service'
import { formatUnits } from 'nestjs-ethers'
import { apiService } from '@app/common/constants/microservices.constants'
import { ClientProxy } from '@nestjs/microservices'
import { callMSFunction } from '@app/common/utils/client-proxy'
import * as amplitude from '@amplitude/analytics-node'
import { operatorWalletModelString } from '@app/accounts-service/operators/operators.constants'
import { OperatorWallet } from '@app/accounts-service/operators/interfaces/operator-wallet.interface'
import { Model } from 'mongoose'

@Injectable()
export class AnalyticsService {
  constructor (
        private readonly usersService: UsersService,
        private readonly projectsService: ProjectsService,
        @Inject(apiService) private readonly apiClient: ClientProxy,
        @Inject(operatorWalletModelString)
        private operatorWalletModel: Model<OperatorWallet>

  ) {
    init(process.env.AMPLITUDE_API_KEY)
  }

  async operatorAccountActivationEvent ({ id, projectId }) {
    try {
      const user = await this.usersService.findOne(id)
      const publicKey = (await this.projectsService.getPublic(projectId)).publicKey
      const eventData = {
        email: user.email,
        apiKey: publicKey
      }
      track('Operator Account Activated', { ...eventData }, { user_id: eventData.email })
    } catch (error) {
      console.error(error)
    }
  }

  async handleUserOpAndWalletAction (body) {
    try {
      const email = await this.getEmail(body.userOp.apiKey)
      if (body.walletAction.name === 'tokenTransfer') {
        console.log('tokenTransfer')
        const event = {
          amount: formatUnits(body.walletAction.sent[0].value, body.walletAction.sent[0].decimals),
          amountUsd: 'amount',
          token: body.walletAction.sent[0].symbol,
          apiKey: body.userOp.apiKey,
          email
        }
        this.transferEvent(event)
      }
      return 'Transfer event processed'
    } catch (error) {
      throw new Error(error)
    }
  }

  async handleReceiveWalletAction (walletAction) {
    if (walletAction.name === 'tokenReceive') {
      try {
        const operator = await this.findOperatorBySmartWallet(walletAction.walletAddress)
        if (!operator) {
          return 'Operator doesnt exist'
        }
        const operatorId = operator.ownerId.toString()
        const user = await this.usersService.findOne(operatorId)
        const projectId = (await this.projectsService.findOneByOwnerId(operatorId))._id.toString()
        const apiKey = (await this.projectsService.getPublic(projectId)).publicKey
        const event = {
          amount: formatUnits(walletAction.sent[0].value, walletAction.sent[0].decimals),
          amountUsd: 'amount',
          token: walletAction.sent[0].symbol,
          apiKey,
          email: user.email
        }
        this.depositEvent(event)
        return 'Receive event processed'
      } catch (error) {
        throw new Error(error)
      }
    }
  }

  async depositEvent (event) {
    try {
      track('Account Balance Deposited', { ...event }, { user_id: event.email })
    } catch (error) {
      console.error(error)
    }
  }

  async transferEvent (event) {
    try {
      track('Transaction (UserOp)', { ...event }, { user_id: event.email })
    } catch (error) {
      console.error(error)
    }
  }

  async getEmail (apiKey) {
    try {
      const projectId = await callMSFunction(this.apiClient, 'get_project_id_by_public_key', apiKey)
      const project = await this.projectsService.findOne(projectId)
      const user = await this.usersService.findOne(project.ownerId.toString())
      return user.email
    } catch (error) {
      console.error(error)
    }
  }

  async findOperatorBySmartWallet (value: string): Promise<OperatorWallet> {
    return this.operatorWalletModel.findOne({ smartWalletAddress: value.toLowerCase() })
  }
}
