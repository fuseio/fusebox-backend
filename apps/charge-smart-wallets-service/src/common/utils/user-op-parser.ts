import { Injectable } from '@nestjs/common'
import { decodeWithCalldata, sigHashFromCalldata, decodeWithEventProps } from '../../../../../libs/common/src/utils/dtools/decodeBySigHash'
import { EventProps } from '../../../../../libs/common/src/utils/dtools/decodeEvent'
import { isNil } from 'lodash'
import { BigNumber } from 'ethers'
import { DecodeResult } from '../../../../../libs/common/src/utils/dtools/decodeCalldata'
import { UserOp } from '@app/smart-wallets-service/data-layer/interfaces/user-op.interface'

export class UserOpParser {
  async parseCallData (callData: string) {
    const decodeResults = await decodeCalldata(
      callData
    )
    if (!decodeResults) {
      throw new Error('Signature is wrong or undefined')
    }

    const walletFunction = decodeResults.map((decoded) => {
      return {
        walletFunction: decoded.fragment.name,
        arguments: this.parseDecodedResult(decoded) as Array<Array<String>>
      }
    })
    let targetFunction
    if (walletFunction[0].walletFunction === 'executeBatch') {
      targetFunction = []
      const batchType = walletFunction[0].arguments[2] ? 2 : 1
      for (let i = 0; i < walletFunction[0].arguments[0].length; i++) {
        const decodedSingleBatchRes = await decodeCalldata(walletFunction[0].arguments[batchType][i] as string)
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
      targetFunction = decodeInnerResults.map((decoded) => {
        return {
          name: decoded.fragment.name,
          arguments: this.parseDecodedResult(decoded)
        }
      })
      return { walletFunction, targetFunction }
    }
    if (decodeResults[0].decoded[2] === '0x') {
      targetFunction = { name: 'nativeTokenTransfer', value: BigInt(walletFunction[0].arguments[1].toString()).toString() }
      return { walletFunction, targetFunction }
    }
    targetFunction = { name: null }
    return { walletFunction, targetFunction }
  }

  async parseEvent (eventProps: EventProps) {
    const sigHash = eventProps.topics[0]
    const parsedEvent = await decodeWithEventProps(sigHash, eventProps)
    return parsedEvent[0]
  }

  parseDecodedResult (decodedCallData: DecodeResult) {
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

@Injectable()
export class UserOpFactory {
  private userOpParser: UserOpParser
  constructor (
  ) {
    this.userOpParser = new UserOpParser()
  }

  async createUserOp (baseUserOp): Promise<UserOp> {
    const decodedCallData = await this.userOpParser.parseCallData(baseUserOp.callData)
    return {
      ...baseUserOp,
      walletFunction: {
        name: decodedCallData.walletFunction[0].walletFunction,
        arguments: decodedCallData.walletFunction[0].arguments
      },
      targetFunction: decodedCallData.targetFunction
    }
  }
}

export async function decodeCalldata (callData: string) {
  return decodeWithCalldata(sigHashFromCalldata(callData), callData)
}

export { EventProps }
