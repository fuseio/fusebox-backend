import { Interface, Log } from 'nestjs-ethers'
import { TokenType } from '@app/common/constants/abi/token-types'
import ERC20_ABI from '@app/common/constants/abi/erc20.json'
import ERC721_ABI from '@app/common/constants/abi/erc721.json'

export function parseLog(log: Log, abi: any) {
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

// TODO: Find a better way to determine the token type of the event
export function getTransferEventTokenType(log: Log) {
    const topics = log.topics.slice(1).length

    return topics === 3 ? TokenType.ERC721 : TokenType.ERC20
}

export function getTokenTypeAbi(tokenType: TokenType) {
    return tokenType === TokenType.ERC20 ? ERC20_ABI : ERC721_ABI
}