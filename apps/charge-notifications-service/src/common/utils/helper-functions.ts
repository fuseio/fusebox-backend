import * as ERC20_ABI from '@app/notifications-service/common/constants/abi/erc20.json'
import * as ERC721_ABI from '@app/notifications-service/common/constants/abi/erc721.json'
import { TokenType } from '@app/notifications-service/common/constants/token-types'
import { Interface } from '@ethersproject/abi'
import { Log } from '@ethersproject/providers'

export const parseLog = (log: Log, abi: any) => {
  const abiInterface = new Interface(abi)
  const parsedLog = abiInterface.parseLog(log)
  return {
    address: log.address,
    transactionHash: log.transactionHash,
    name: parsedLog.name,
    signature: parsedLog.signature,
    topic: parsedLog.topic,
    args: parsedLog.args
  }
}

export const sleep = (time: number) => {
  return new Promise((resolve) => setTimeout(resolve, time))
}

export const getTransferEventTokenType = (log: Log) => {
  const topics = log.topics.slice(1).length
  return topics === 3 ? TokenType.ERC721 : TokenType.ERC20
}

export const getTokenTypeAbi = (tokenType: TokenType) => {
  return tokenType === TokenType.ERC20 ? ERC20_ABI : ERC721_ABI
}
