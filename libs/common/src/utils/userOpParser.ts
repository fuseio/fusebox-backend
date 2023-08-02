import { Injectable } from '@nestjs/common'
import { decodeWithCalldata, sigHashFromCalldata, decodeWithEventProps } from './dtools/decodeBySigHash'
import { EventProps } from './dtools/decodeEvent'
@Injectable()
export class UserOpParser {

  async parseCallData(callData: string) {
    // const txDataBuffer = toBuffer(callData);
    let response = await decodeCalldata(callData)
    const walletMethod = response[0]
    const walletCallData = walletMethod.decoded[2] as string
    response = await decodeCalldata(walletCallData)
    const targetMethod = response[0]
    return { walletMethod, targetMethod }
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

