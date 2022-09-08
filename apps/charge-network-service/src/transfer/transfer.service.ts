import { Injectable } from '@nestjs/common'
import { TransferDto } from '@app/network-service/transfer/dto/trasfer.dto'
import { AddressDto } from '@app/network-service/transfer/dto/walletAddress.dto'
import Web3ProviderService from '@app/common/services/web3-provider.service'
// import erc20 from '@app/common/constants/abi/erc20.json'
import { TokenType } from '@app/common/constants/abi/token-types'
import { getTokenTypeAbi, getTransferEventTokenType, parseLog } from '@app/common/utils/helper-functions'
import { hexZeroPad } from 'nestjs-ethers'
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'
import _ from 'lodash'
import { map, lastValueFrom } from 'rxjs'
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
    const promisesLog = logs.map(async (log) => await this.processEvent(log as any))
    const mappedlog = await Promise.all(promisesLog)
    return mappedlog
  }

  tokenListPost (addressDto: AddressDto) {
    return this.httpService.get(this.configService.get('fuseExplorerUrl') + `?module=account&action=tokenlist&address=${addressDto.address}`).pipe(
      map(response => response.data)
    )
  }

  tokenHoldersPost (addressDto: AddressDto) {
    return this.httpService.get(this.configService.get('fuseExplorerUrl') + `?module=token&action=getTokenHolders&contractaddress=${addressDto.address}`).pipe(
      map(response => response.data)
    )
  }

  async allWalletTransactions (addressDto: AddressDto): Promise<any> {
    const [regularTxns, tokenTxns, internalTxns] = await Promise.all([
      lastValueFrom(this.httpService.get(
        this.configService.get('fuseExplorerUrl') + `?module=account&action=txlist&address=${addressDto.address}`
      ).pipe(map(response => { return response.data.result }))
      ),
      lastValueFrom(this.httpService.get(
        this.configService.get('fuseExplorerUrl') + `?module=account&action=tokentx&address=${addressDto.address}`
      ).pipe(map(response => { return response.data.result }))
      ),
      lastValueFrom(this.httpService.get(
        this.configService.get('fuseExplorerUrl') + `?module=account&action=txlistinternal&address=${addressDto.address}`
      ).pipe(map(response => { return response.data.result }))
      )
    ])

    return {
      regularTransactions: regularTxns,
      tokenTransactions: tokenTxns,
      internalTransactions: internalTxns
    }
  }

  async queryCreate (transferDto: TransferDto) {
    const toAddress = transferDto.toAddress
    const fromAddress = transferDto.fromAddress
    const toBlock = this.blockExCheck(transferDto.toBlock)
    const fromBlock = this.blockExCheck(transferDto.fromBlock)
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

  blockExCheck (addressData) {
    if (_.isEmpty(addressData)) return 'latest'
    return addressData
  }

  async processEvent (log: any) {
    const tokenType = getTransferEventTokenType(log)
    const abi = getTokenTypeAbi(tokenType)
    const parsedLog = parseLog(log, abi)
    const fromAddress = parsedLog.args[0]
    const toAddress = parsedLog.args[1]

    const data: Record<string, any> = {
      to: toAddress,
      from: fromAddress,
      txHash: parsedLog.transactionHash,
      tokenAddress: parsedLog.address,
      blockNumber: log.blockNumber,
      blockHash: log.blockHash,
      tokenType: tokenType?.valueOf()

    }

    if (tokenType === TokenType.ERC20) {
      data.value = (parsedLog.args[2] / 1000000000000000000).toString()
    } else {
      data.tokenId = parseInt(parsedLog.args.tokenId?._hex)
    }

    return await data
  }
}
