import { Injectable } from '@nestjs/common'
import { decodeWithCalldata, sigHashFromCalldata, decodeWithEventProps } from './dtools/decodeBySigHash'
import { EventProps } from './dtools/decodeEvent'
import { isNil } from 'lodash'
import { BigNumber } from 'ethers'
import { DecodeResult } from './dtools/decodeCalldata'

@Injectable()
export class UserOpParser {
  async parseCallData(callData: string) {
    const decodeResults = await decodeCalldata(
      callData
    )
    if (!decodeResults) {
      console.log('Signature is wrong or undefined')
    }

    const walletFunction = decodeResults.map((decoded) => {
      return {
        walletFunction: decoded.fragment.name,
        arguments: this.parseDecodedResult(decoded) as Array<Array<String>>
      }
    })

    if (walletFunction[0].walletFunction === 'executeBatch') {
      const targetFunction = []
      for (let i = 0; i < walletFunction[0].arguments[0].length; i++) {
        const decodedSingleBatchRes = await decodeCalldata(walletFunction[0].arguments[2][i] as string)
        const mappedDecodedSingleBatch = decodedSingleBatchRes.map((decoded) => {
          return {
            name: decoded.fragment.name,
            arguments: this.parseDecodedResult(decoded)
          }
        })
        targetFunction.push({
          targetAddress: walletFunction[0].arguments[0][i],
          value: BigInt(walletFunction[0].arguments[1][i] as string).toString(),
          name: mappedDecodedSingleBatch[0].name,
          arguments: mappedDecodedSingleBatch[0].arguments
        })
      }
      return { walletFunction, targetFunction }
    }

    if (!isNil(decodeResults[0].decoded[2]) && decodeResults[0].decoded[2] !== '0x') {
      const decodeInnerResults = await decodeCalldata(decodeResults[0].decoded[2] as string)
      const targetFunction = decodeInnerResults.map((decoded) => {
        return {
          name: decoded.fragment.name,
          arguments: this.parseDecodedResult(decoded)
        }
      })
      return { walletFunction, targetFunction }
    }
    if (decodeResults[0].decoded[2] === '0x') {
      const targetFunction = { name: 'nativeTokenTransfer', value: BigInt(walletFunction[0].arguments[1].toString()).toString() }
      return { walletFunction, targetFunction }
    }
    const targetFunction = { name: null }
    return { walletFunction, targetFunction }
  }

  async parseEvent(eventProps: EventProps) {
    const sigHash = eventProps.topics[0]
    const parsedEvent = await decodeWithEventProps(sigHash, eventProps)
    return parsedEvent[0]
  }
  parseDecodedResult(decodedCallData: DecodeResult) {
    const args = []
    for (let i = 0; i < decodedCallData.decoded.length; i++) {
      if (BigNumber.isBigNumber(decodedCallData.decoded[i])) {
        args[i] = BigInt(decodedCallData.decoded[i] as string).toString()
      } else {
        args[i] = decodedCallData.decoded[i]
      }
    }
    return args
  }
}



export async function decodeCalldata(callData: string) {
  return decodeWithCalldata(sigHashFromCalldata(callData), callData)
}

export { EventProps }
