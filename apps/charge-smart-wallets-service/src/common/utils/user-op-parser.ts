import { Injectable } from '@nestjs/common'
import { decodeWithCalldata, sigHashFromCalldata } from '../../../../../libs/common/src/utils/dtools/decodeBySigHash'
import { BigNumber } from 'ethers'
import { UserOp } from '@app/smart-wallets-service/data-layer/interfaces/user-op.interface'

export class UserOpParser {
  transformArray (input) {
    const [targets, values, data] = input

    return targets.map((targetAddress, index) => ({
      targetAddress,
      value: BigNumber.from(values[index]),
      data: data[index]
    }))
  }

  async getTargetFunction (calls) {
    return await Promise.all(calls.map(async (call) => {
      if (call.data === '0x') {
        return {
          targetAddress: call.targetAddress,
          value: call.value.toString(),
          name: 'nativeTokenTransfer'
        }
      } else {
        const decodedCallData = await decodeCalldata(call.data)
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
    const decodeResults = await decodeCalldata(
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

    return { name: fragment.name, calls, targetFunctions }
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
    const { targetFunctions, name, calls } = await this.userOpParser.parseCallData(baseUserOp.callData)
    return {
      ...baseUserOp,
      walletFunction: {
        name,
        calls
      },
      targetFunctions
    }
  }
}

export async function decodeCalldata (callData: string) {
  return decodeWithCalldata(sigHashFromCalldata(callData), callData)
}
