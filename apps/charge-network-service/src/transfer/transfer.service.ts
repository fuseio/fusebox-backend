import { Injectable } from '@nestjs/common'
import { TransferDto } from '@app/network-service/transfer/dto/trasfer.dto'
import Web3ProviderService from '@app/common/services/web3-provider.service'
import erc20 from '@app/common/constants/abi/erc20.json'
import { TokenType } from '@app/common/constants/abi/token-types'
import { getTokenTypeAbi, getTransferEventTokenType, parseLog } from '@app/common/utils/helper-functions'
import { hexZeroPad } from 'nestjs-ethers'
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'
import _ from 'lodash'

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

  async transferPost (transferDto: TransferDto) {
    const logs = await this.queryCreate(transferDto)
    const promisesLog = logs.map(async (log) => await this.processEvent(log as any))
    const mappedlog = await Promise.all(promisesLog)
    return mappedlog
  }

  // transferPost(transferDto: TransferDto) {
  //     return this.httpService.get(FUSE_URL + `?module=account&action=pendingtxlist&address=${transferDto.fromAddress}`).pipe(
  //         map(response => response.data)
  //     );
  //  }

  async queryCreate (transferDto: TransferDto) {
    const toAddress = transferDto.toAddress
    const fromAddress = transferDto.fromAddress
    if (!_.isEmpty(transferDto.minted) && !_.isEmpty(toAddress)) {
      return await this.web3Provider.eth.getPastLogs({
        fromBlock: transferDto.fromBlock,
        toBlock: transferDto.toBlock,
        address: transferDto.tokenAddress.toLowerCase(),
        topics: [this.transferEventHash,
          hexZeroPad('0x0000000000000000000000000000000000000000', 32),
          hexZeroPad(transferDto.toAddress, 32)]
      })
    }
    if (!_.isEmpty(transferDto.minted)) {
      return await this.web3Provider.eth.getPastLogs({
        fromBlock: transferDto.fromBlock,
        toBlock: transferDto.toBlock,
        address: transferDto.tokenAddress.toLowerCase(),
        topics: [this.transferEventHash,
          hexZeroPad('0x0000000000000000000000000000000000000000', 32)]
      })
    }
    if (!_.isEmpty(fromAddress) && !_.isEmpty(toAddress)) {
      return await this.web3Provider.eth.getPastLogs({
        fromBlock: transferDto.fromBlock,
        toBlock: transferDto.toBlock,
        address: transferDto.tokenAddress.toLowerCase(),
        topics: [this.transferEventHash,
          hexZeroPad(transferDto.fromAddress, 32),
          hexZeroPad(transferDto.toAddress, 32)]
      })
    }
    if (!_.isEmpty(fromAddress)) {
      return await this.web3Provider.eth.getPastLogs({
        fromBlock: transferDto.fromBlock,
        toBlock: transferDto.toBlock,
        address: transferDto.tokenAddress.toLowerCase(),
        topics: [this.transferEventHash,
          hexZeroPad(transferDto.fromAddress, 32)]
      })
    }
    if (!_.isEmpty(toAddress)) {
      return await this.web3Provider.eth.getPastLogs({
        fromBlock: transferDto.fromBlock,
        toBlock: transferDto.toBlock,
        address: transferDto.tokenAddress.toLowerCase(),
        topics: [this.transferEventHash, undefined,
          hexZeroPad(transferDto.toAddress, 32)]
      })
    }
    if (_.isEmpty(fromAddress) && _.isEmpty(toAddress)) {
      return await this.web3Provider.eth.getPastLogs({
        fromBlock: transferDto.fromBlock,
        toBlock: transferDto.toBlock,
        address: transferDto.tokenAddress.toLowerCase(),
        topics: [this.transferEventHash]
      })
    }
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
