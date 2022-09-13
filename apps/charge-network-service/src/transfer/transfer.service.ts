import { Injectable } from '@nestjs/common'
import { TransferDto } from '@app/network-service/transfer/dto/trasfer.dto'
import { WalletAddressDto } from '@app/network-service/transfer/dto/walletAddress.dto'
import { ContractAddressDto } from '@app/network-service/transfer/dto/contractAddress.dto'
import { allTransactionsDto } from '@app/network-service/transfer/dto/allTransactions.dto'
import Web3ProviderService from '@app/common/services/web3-provider.service'
import { hexZeroPad } from 'nestjs-ethers'
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'
import _ from 'lodash'
import { map, lastValueFrom } from 'rxjs'
import { logFormatter, tokenHoldersFormatter, tokenListFormatter, allTransactionsFormatter, blockExCheck } from '@app/network-service/common/utils/formatters'
import { PromiseActions } from '@app/network-service/common/constants/actions/promise-functions-actions'
@Injectable()
export class TransferService {
  constructor (
        private readonly web3ProviderService: Web3ProviderService,
        private httpService: HttpService,
        private configService: ConfigService

  ) { }

  get web3Provider () {
    return this.web3ProviderService.getProvider()
  }

  transferEventHash = this.configService.get('transferEventHash')

  async transfersPost (transferDto: TransferDto) {
    const logs = await this.queryCreate(transferDto)
    const promisesLog = logs.map(async (log) => await logFormatter(log as any))
    const mappedlog = await Promise.all(promisesLog)
    return mappedlog
  }

  async tokenListPost (walletAddressDto: WalletAddressDto) {
    const nonFormattedResponse = await this.promiseExplorerAddressResponse(PromiseActions.tokenlist, walletAddressDto)
    return tokenListFormatter(nonFormattedResponse)
  }

  async tokenHoldersPost (contractAddressDto: ContractAddressDto) {
    const nonFormattedResponse = await this.promiseExplorerAddressResponse(PromiseActions.getTokenHolders, contractAddressDto)
    return tokenHoldersFormatter(nonFormattedResponse)
  }

  async allWalletTransactions (allTransactionsDto: allTransactionsDto): Promise<any> {
    const [regularTxns, tokenTxns, internalTxns] = await Promise.all([
      this.promiseExplorerAllTxnsResponse(PromiseActions.regular, allTransactionsDto),
      this.promiseExplorerAllTxnsResponse(PromiseActions.token, allTransactionsDto),
      this.promiseExplorerAllTxnsResponse(PromiseActions.internal, allTransactionsDto)
    ])

    return {
      ...allTransactionsFormatter(regularTxns, PromiseActions.regular),
      ...allTransactionsFormatter(tokenTxns, PromiseActions.token),
      ...allTransactionsFormatter(internalTxns, PromiseActions.internal)
    }
  }

  async queryCreate (transferDto: TransferDto) {
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

  promiseExplorerAddressResponse (type: string, dto: any) {
    const fuseUrl = this.configService.get('fuseExplorerUrl')
    const page = dto.page ? `&page=${parseInt(dto.page)}` : ''
    const offset = dto.offset ? `&offset=${parseInt(dto.offset)}` : ''
    let action
    let module
    let addressType
    if (type === PromiseActions.getTokenHolders) {
      action = PromiseActions.getTokenHolders
      module = 'token'
      addressType = 'contractaddress'
    }
    if (type === PromiseActions.tokenlist) {
      action = PromiseActions.tokenlist
      module = 'account'
      addressType = 'address'
    }
    if (_.isEmpty(action)) return 'invalid type'
    return lastValueFrom(this.httpService.get(
            `${fuseUrl}?module=${module}&action=${action}&${addressType}=${dto.address}${page}${offset}`
    ).pipe(map(response => response.data.result)))
  }

  promiseExplorerAllTxnsResponse (type: string, dto: allTransactionsDto) {
    const fuseUrl = this.configService.get('fuseExplorerUrl')
    const sort = dto.sort ? `&sort=${dto.sort}` : ''
    const fromBlock = dto.startblock ? `&startblock=${parseInt(dto.startblock)}` : ''
    const toBlock = dto.endblock ? `&endblock=${parseInt(dto.endblock)}` : ''
    const page = dto.page ? `&page=${parseInt(dto.page)}` : ''
    const offset = dto.offset ? `&offset=${parseInt(dto.offset)}` : ''
    let action
    if (type === PromiseActions.internal) action = 'txlistinternal'
    if (type === PromiseActions.token) action = 'tokentx'
    if (type === PromiseActions.regular) action = 'txlist'
    if (_.isEmpty(action)) return 'invalid type'
    return lastValueFrom(this.httpService.get(`${fuseUrl}?module=account&action=${action}&address=${dto.address}${sort}${fromBlock}${toBlock}${page}${offset}`
    ).pipe(map(response => { return response.data.result }))
    )
  }
}
