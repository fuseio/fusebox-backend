import { formatEther, BigNumber } from 'nestjs-ethers'
import { getTokenTypeAbi, getTransferEventTokenType, parseLog } from '@app/common/utils/helper-functions'
import { TokenType } from '@app/common/constants/abi/token-types'
import web3js from 'web3'


export const logFormatter = (log: any) => {
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
        data.value = BigNumber.from(parsedLog.args[2]).toString()
        data.valueEth = formatEther(BigNumber.from(parsedLog.args[2]).toString())
    } else {
        data.tokenId = parseInt(parsedLog.args.tokenId?._hex)
    }

    return data
}

export const tokenListFormatter = (arr: any) => {
    return arr.map((entity) => {
        const formatted = {
            ...entity,
            contractAddress: web3js.utils.toChecksumAddress(entity.contractAddress),
            balanceEth: entity.decimals === '' ? '' : (entity.balance / 10 ** entity.decimals).toString()
        } as any
        return formatted
    }
    )
}

export const tokenHoldersFormatter = (arr: any) => {
    return arr.map((entity) => {
        const formatted = {
            ...entity,
            valueEth: formatEther(entity.value),
            address: web3js.utils.toChecksumAddress(entity.address)

        } as any
        return formatted
    }
    )
}
export const allTransactionsFormatter = (arr: any, txnType) => {
    if (txnType === 'token') {
        return arr.map((entity) => {
            const formatted = {
                ...entity,
                valueEth: entity.value ? (entity.value / 10 ** entity.tokenDecimal).toString() : '',
                contractAddress: entity.contractAddress ? web3js.utils.toChecksumAddress(entity.contractAddress) : '',
                to: entity.to ? web3js.utils.toChecksumAddress(entity.to) : '',
                transactionType: txnType

            } as any
            return formatted
        }
        )
    }

    return arr.map((entity) => {
        const formatted = {
            ...entity,
            valueEth: entity.value ? formatEther(BigNumber.from(entity.value.toString())) : '',
            contractAddress: entity.contractAddress ? web3js.utils.toChecksumAddress(entity.contractAddress) : '',
            to: entity.to ? web3js.utils.toChecksumAddress(entity.to) : '',
            transactionType: txnType

        } as any
        return formatted
    }
    )
}
