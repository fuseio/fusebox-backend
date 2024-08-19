import { decodeWithSelector } from '@app/common/utils/calldata-decoder/decoder'
import { Injectable } from '@nestjs/common'
import { BigNumber } from 'nestjs-ethers'

@Injectable()
export class UserOpParser {
  async decodeCalldata(callData: string) {
    return decodeWithSelector({ calldata: callData })
  }

  private transformArray(input) {
    const [targets, values, data] = input

    return targets.map((targetAddress, index) => ({
      targetAddress,
      value: BigNumber.from(values[index]),
      data: data[index]
    }))
  }

  async getTargetFunction(calls) {
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
          callData: decodedCallData.args,
          name: decodedCallData.name || decodedCallData.fragment?.name
        }
      }
    }))
  }

  async parseCallData(callData: string) {
    const decodeResults = await this.decodeCalldata(callData)
    if (!decodeResults) {
      throw new Error('Signature is wrong or undefined')
    }

    const { args, name, fragment } = decodeResults
    const fragmentName = name || fragment?.name

    const calls = []
    if (fragmentName === 'executeBatch') {
      const items = this.transformArray(args)
      calls.push(...items)
    } else {
      const items = this.transformArray([[args[0]], [args[1]], [args[2]]])
      calls.push(...items)
    }

    const targetFunctions = await this.getTargetFunction(calls)

    return { name: fragmentName, targetFunctions }
  }
}
