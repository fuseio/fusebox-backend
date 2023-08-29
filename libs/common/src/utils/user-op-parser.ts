import { Injectable } from '@nestjs/common'
import { decodeWithCalldata, sigHashFromCalldata, decodeWithEventProps } from './dtools/decodeBySigHash'
import { EventProps } from './dtools/decodeEvent'
import { isNil } from 'lodash'
import { BigNumber } from 'ethers'

@Injectable()
export class UserOpParser {
  async parseCallData(callData: string) {
    const decodeResults = await decodeCalldata(
      callData
    )
    if (!decodeResults) {
      console.log('Signature is wrong or undefined')
    }

    /// Batch transaction handle
    const walletFunction = decodeResults.map((decoded) => {
      const args = []
      for (let i = 0; i < decoded.decoded.length; i++) {
        if (BigNumber.isBigNumber(decoded.decoded[i])) {
          args[i] = BigInt(decoded.decoded[i] as string).toString()
        } else {
          args[i] = decoded.decoded[i]
        }
      }
      return {
        walletFunction: decoded.fragment.name,
        arguments: args as Array<Array<String>>
      }
    })

    if (walletFunction[0].walletFunction === 'executeBatch') {
      const targetFunction = []
      for (let i = 0; i < walletFunction[0].arguments[0].length; i++) {
        const decodedSingleBatchRes = await decodeCalldata(walletFunction[0].arguments[2][i] as string)
        const mappedDecodedSingleBatch = decodedSingleBatchRes.map((decoded) => {
          const args = []
          for (let i = 0; i < decoded.decoded.length; i++) {
            if (BigNumber.isBigNumber(decoded.decoded[i])) {
              args[i] = BigInt(decoded.decoded[i] as string).toString()
            } else {
              args[i] = decoded.decoded[i]
            }
          }
          return {
            name: decoded.fragment.name,
            arguments: args

          }
        })
        targetFunction.push({
          targetAddress: walletFunction[0].arguments[0][i],
          name: mappedDecodedSingleBatch[0].name,
          arguments: mappedDecodedSingleBatch[0].arguments
        })
      }
      return { walletFunction, targetFunction }
    }
    /// ERC-20/NFT  transfer handle
    if (!isNil(decodeResults[0].decoded[2]) && decodeResults[0].decoded[2] !== '0x') {
      const decodeInnerResults = await decodeCalldata(decodeResults[0].decoded[2] as string)
      const targetFunction = decodeInnerResults.map((decoded) => {
        const args = []
        for (let i = 0; i < decoded.decoded.length; i++) {
          if (BigNumber.isBigNumber(decoded.decoded[i])) {
            args[i] = BigInt(decoded.decoded[i] as string).toString()
          } else {
            args[i] = decoded.decoded[i]
          }
        }
        return {
          name: decoded.fragment.name,
          arguments: args
        }
      })

      return { walletFunction, targetFunction }
    } else {
      const targetFunction = { name: 'nativeTokenTransfer', value: BigInt(walletFunction[0].arguments[1].toString()).toString() }
      return { walletFunction, targetFunction }
    }
  }

  async parseEvent(eventProps: EventProps) {
    const sigHash = eventProps.topics[0]
    const parsedEvent = await decodeWithEventProps(sigHash, eventProps)
    return parsedEvent[0]
  }
}

export async function decodeCalldata(callData: string) {
  return decodeWithCalldata(sigHashFromCalldata(callData), callData)
}

export { EventProps }
