import { decodeWithCalldata, sigHashFromCalldata } from '@app/common/utils/dtools/decodeBySigHash'
import { Injectable } from '@nestjs/common'
import { BigNumber } from '@ethersproject/bignumber'

@Injectable()
export class UserOpParser {
  async decodeCalldata (callData: string) {
    return decodeWithCalldata(sigHashFromCalldata(callData), callData)
  }

  private transformArray (input) {
    const [targets, values, data] = input

    return targets.map((targetAddress, index) => ({
      targetAddress,
      value: BigNumber.from(values[index]),
      data: data[index]
    }))
  }

  async getTargetFunction (calls) {
    return Promise.all(calls.map(async (call) => {
      if (call.data === '0x') {
        return {
          targetAddress: call.targetAddress,
          value: call.value.toString(),
          callData: call.data,
          name: 'nativeTransfer'
        }
      } else {
        const decodedCallData = await this.decodeCalldata(call.data)
        return {
          targetAddress: call.targetAddress,
          value: call.value.toString(),
          callData: decodedCallData[0].decoded,
          name: decodedCallData[0].fragment.name
        }
      }
    }))
  }

  async parseCallData (callData: string) {
    const decodeResults = await this.decodeCalldata(
      callData
    )
    if (!decodeResults) {
      throw new Error('Signature is wrong or undefined')
    }

    const { decoded, fragment } = decodeResults[0]
    const calls = []
    if (fragment.name === 'executeBatch') {
      const items = this.transformArray(decoded)
      calls.push(...items)
    } else {
      const items = this.transformArray([[decoded[0]], [decoded[1]], [decoded[2]]])
      calls.push(...items)
    }

    const targetFunctions = await this.getTargetFunction(calls)

    return { name: fragment.name, targetFunctions }
  }
}
