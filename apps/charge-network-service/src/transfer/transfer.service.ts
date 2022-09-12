import { Injectable } from '@nestjs/common'
import { TransferDto } from '@app/network-service/transfer/dto/trasfer.dto'
import { AddressDto } from '@app/network-service/transfer/dto/walletAddress.dto'
import { allTransactionsDto } from '@app/network-service/transfer/dto/allTransactions.dto'
import Web3ProviderService from '@app/common/services/web3-provider.service'
import { hexZeroPad } from 'nestjs-ethers'
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'
import _ from 'lodash'
import { map, lastValueFrom } from 'rxjs'
import { logFormatter, tokenHoldersFormatter, tokenListFormatter, allTransactionsFormatter, blockExCheck } from '@app/network-service/common/utils/formatters'
import e from 'express'
@Injectable()
export class TransferService {
    constructor(
        private readonly web3ProviderService: Web3ProviderService,
        private httpService: HttpService,
        private configService: ConfigService

    ) { }

    get web3Provider() {
        return this.web3ProviderService.getProvider()
    }

    transferEventHash = this.configService.get('transferEventHash')

    async transfersPost(transferDto: TransferDto) {
        const logs = await this.queryCreate(transferDto)
        const promisesLog = logs.map(async (log) => await logFormatter(log as any))
        const mappedlog = await Promise.all(promisesLog)
        return mappedlog
    }

    async tokenListPost(addressDto: AddressDto) {
        const nonFormattedResponse = await this.promiseExplorerAddressResponse('tokenList', addressDto)
        return tokenListFormatter(nonFormattedResponse)
    }

    async tokenHoldersPost(addressDto: AddressDto) {
        const nonFormattedResponse = await this.promiseExplorerAddressResponse('holders', addressDto)
        return tokenHoldersFormatter(nonFormattedResponse)
    }

    async allWalletTransactions(allTransactionsDto: allTransactionsDto): Promise<any> {
        const [regularTxns, tokenTxns, internalTxns] = await Promise.all([
            this.promiseExplorerAllTxnsResponse('regular', allTransactionsDto),
            this.promiseExplorerAllTxnsResponse('token', allTransactionsDto),
            this.promiseExplorerAllTxnsResponse('internal', allTransactionsDto)
        ])

        return {
            ...allTransactionsFormatter(regularTxns, 'regular'),
            ...allTransactionsFormatter(tokenTxns, 'token'),
            ...allTransactionsFormatter(internalTxns, 'internal')
        }
    }

    async queryCreate(transferDto: TransferDto) {
        const toAddress = transferDto.toAddress
        const fromAddress = transferDto.fromAddress
        const toBlock = blockExCheck(transferDto.toBlock)
        const fromBlock = blockExCheck(transferDto.fromBlock)
        if (transferDto.minted && !_.isEmpty(toAddress)) {
            return await this.web3Provider.eth.getPastLogs({
                fromBlock,
                toBlock: transferDto.toBlock,
                address: transferDto.tokenAddress.toLowerCase(),
                topics: [this.transferEventHash,
                hexZeroPad('0x0000000000000000000000000000000000000000', 32),
                hexZeroPad(transferDto.toAddress, 32)]
            })
        }
        if (transferDto.minted) {
            return await this.web3Provider.eth.getPastLogs({
                fromBlock,
                toBlock,
                address: transferDto.tokenAddress.toLowerCase(),
                topics: [this.transferEventHash,
                hexZeroPad('0x0000000000000000000000000000000000000000', 32), undefined]
            })
        }
        if (!_.isEmpty(fromAddress) && !_.isEmpty(toAddress)) {
            return await this.web3Provider.eth.getPastLogs({
                fromBlock,
                toBlock,
                address: transferDto.tokenAddress.toLowerCase(),
                topics: [this.transferEventHash,
                hexZeroPad(transferDto.fromAddress, 32),
                hexZeroPad(transferDto.toAddress, 32)]
            })
        }
        if (!_.isEmpty(fromAddress)) {
            return await this.web3Provider.eth.getPastLogs({
                fromBlock,
                toBlock,
                address: transferDto.tokenAddress.toLowerCase(),
                topics: [this.transferEventHash,
                hexZeroPad(transferDto.fromAddress, 32)]
            })
        }
        if (!_.isEmpty(toAddress)) {
            return await this.web3Provider.eth.getPastLogs({
                fromBlock,
                toBlock,
                address: transferDto.tokenAddress.toLowerCase(),
                topics: [this.transferEventHash, undefined,
                hexZeroPad(transferDto.toAddress, 32)]
            })
        }
        if (_.isEmpty(fromAddress) && _.isEmpty(toAddress)) {
            return await this.web3Provider.eth.getPastLogs({
                fromBlock,
                toBlock,
                address: transferDto.tokenAddress.toLowerCase(),
                topics: [this.transferEventHash]
            })
        }
    }

    promiseExplorerAddressResponse(type: string, dto: any) {
        const fuseUrl = this.configService.get('fuseExplorerUrl')
        let action
        let module
        let addressType
        if (type === 'holders') {
            action = 'getTokenHolders'
            module = 'token'
            addressType = 'contractaddress'
        }
        if (type === 'tokenList') {
            action = 'tokenlist'
            module = 'account'
            addressType = 'address'
        }
        if (_.isEmpty(action)) return 'invalid type'
        return lastValueFrom(this.httpService.get(
            `${fuseUrl}?module=${module}&action=${action}&${addressType}=${dto.address}`
        ).pipe(map(response => response.data.result)))
    }

    promiseExplorerAllTxnsResponse(type: string, dto: allTransactionsDto) {
        const fuseUrl = this.configService.get('fuseExplorerUrl')
        let action
        if (type === 'internal') action = 'txlistinternal'
        if (type === 'token') action = 'tokentx'
        if (type === 'regular') action = 'txlist'
        if (_.isEmpty(action)) return 'invalid type'
        return lastValueFrom(this.httpService.get(`${fuseUrl}?module=account&action=${action}&address=${dto.address}`
        ).pipe(map(response => { return response.data.result }))
        )
    }
}
