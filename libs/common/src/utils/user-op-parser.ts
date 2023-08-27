import { Injectable } from '@nestjs/common'
import { decodeWithCalldata, sigHashFromCalldata, decodeWithEventProps } from './dtools/decodeBySigHash'
import { EventProps } from './dtools/decodeEvent'
import { isNil } from 'lodash'
@Injectable()
export class UserOpParser {
  async parseCallData (callData: string) {
    // const txDataBuffer = toBuffer(callData);
    // let response = await decodeCalldata(callData)
    // const walletMethod = response[0]
    // const walletCallData = walletMethod.decoded[2] as string
    // response = await decodeCalldata(walletCallData)
    // const targetMethod = response[0]
    // return { walletMethod, targetMethod }
    const decodeResults = await decodeCalldata(
      callData
    )
    if (!decodeResults) {
      console.log('Signature is wrong or undefined')
    }
    if (!isNil(decodeResults[0].decoded[2]) && decodeResults[0].decoded[2] !== '0x') {
      const decodeInnerResults = await decodeCalldata(decodeResults[0].decoded[2] as string)
      const mappedResults = decodeInnerResults.map((decoded) => {
        return {
          fnName: decoded.fragment.name,
          fnType: decoded.fragment.type,
          decoded: decoded.decoded,
          inputs: decoded?.fragment?.inputs
        }
      })
      return mappedResults
    } else {
      const mappedResults = decodeResults.map((decoded) => {
        return {
          fnName: decoded.fragment.name,
          fnType: decoded.fragment.type,
          decoded: decoded.decoded,
          inputs: decoded.fragment.inputs
        }
      })
      return mappedResults
    }
  }

  async parseEvent (eventProps: EventProps) {
    const sigHash = eventProps.topics[0]
    const parsedEvent = await decodeWithEventProps(sigHash, eventProps)
    return parsedEvent[0]
  }
}

export async function decodeCalldata (callData: string) {
  return decodeWithCalldata(sigHashFromCalldata(callData), callData)
}

export { EventProps }
