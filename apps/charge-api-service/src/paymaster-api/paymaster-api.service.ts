import { accountsService } from '@app/common/constants/microservices.constants'
import { ClientProxy } from '@nestjs/microservices'
import { callMSFunction } from '@app/common/utils/client-proxy'
import { HttpService } from '@nestjs/axios'
import {
    Injectable,
    Inject,
} from '@nestjs/common'

@Injectable()
export class PaymasterApiService {
    constructor(
        @Inject(accountsService) private readonly accountClient: ClientProxy,
    ) { }


    async getPaymasterData(context: any) {
        const projectId = context.projectId.toString()
        const paymasterInfo = await callMSFunction(this.accountClient, 'get_paymaster_info', projectId)
        return paymasterInfo
    }
}
