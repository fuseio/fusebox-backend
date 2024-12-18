import { decodeWithSelector } from '@app/common/utils/calldata-decoder/decoder'
import { Injectable, Logger } from '@nestjs/common'
import { BigNumber } from 'nestjs-ethers'
import { ethers } from 'ethers'

@Injectable()
export class UserOpParser {
  private readonly logger = new Logger(UserOpParser.name)
  async decodeCalldata (callData: string) {
    return decodeWithSelector({ calldata: callData })
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
          callData: decodedCallData.args,
          name: decodedCallData.name || decodedCallData.fragment?.name
        }
      }
    }))
  }

  async parseCallData (callData: string) {
    const decodeResults = await this.decodeCalldata(callData)
    if (!decodeResults) {
      throw new Error('Signature is wrong or undefined')
    }

    let { args, name, fragment } = decodeResults
    const [firstArg, secondArg] = args

    if (args.length === 2 && firstArg === '0x0000000000000000000000000000000000000000000000000000000000000000') {
      args = this.decodeExecutionCallData(secondArg)
    } else if (args.length === 2 && firstArg === '0x0100000000000000000000000000000000000000000000000000000000000000') {
      // TODO: handle Safe batchs
    }

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

  private decodeExecutionCallData (encodedData: string) {
    const to = '0x' + encodedData.slice(0, 42)
    const value = ethers.BigNumber.from('0x' + encodedData.slice(42, 106)).toString()
    const data = '0x' + encodedData.slice(106)

    return [to, value, data]
  }
}
