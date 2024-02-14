import { Inject, Injectable } from '@nestjs/common'
import { init, track } from '@amplitude/analytics-node'
import { UsersService } from '@app/accounts-service/users/users.service'
import { ProjectsService } from '@app/accounts-service/projects/projects.service'
import { formatUnits } from 'nestjs-ethers'
import { apiService } from '@app/common/constants/microservices.constants'
import { ClientProxy } from '@nestjs/microservices'
import { callMSFunction } from '@app/common/utils/client-proxy'
import * as amplitude from '@amplitude/analytics-node'

@Injectable()
export class AnalyticsService {
  constructor (
        private readonly usersService: UsersService,
        private readonly projectsService: ProjectsService,
        @Inject(apiService) private readonly apiClient: ClientProxy

  ) {
    init(process.env.AMPLITUDE_API_KEY, {
      logLevel: amplitude.Types.LogLevel.Debug
    })
  }

  async operatorAccountActivationEvent ({ id, projectId }) {
    try {
      const user = await this.usersService.findOne(id)
      const publicKey = await this.projectsService.getPublic(projectId)
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

      if (body.walletAction.name === 'tokenReceive') {
        console.log('tokenReceive')
        const user = await this.usersService.findOneByAuth0Id(body.walletAddress)
        console.log(user)

        const project = await this.projectsService.findOneByOwnerId(user._id)
        const apiKey = await this.projectsService.getPublic(project._id)
        const email = await this.getEmail(body.userOp.apiKey)
        const event = {
          amount: formatUnits(body.walletAction.sent.value, body.walletAction.sent.decimals),
          amountUsd: 'amount',
          token: body.walletAction.sent[0].symbol,
          apiKey,
          email: user.email
        }
        this.depositEvent(event)
      }
    } catch (error) {
      console.error(error)
    }

    return 'handleUserOpAndWalletAction'
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
}
