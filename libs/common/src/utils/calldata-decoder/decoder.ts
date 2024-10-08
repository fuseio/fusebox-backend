import {
  decodeABIEncodedData,
  decodeByGuessingFunctionFragment,
  decodeSafeMultiSendTransactionsParam,
  decodeUniversalRouterCommands,
  decodeUniversalRouterPath
} from '@app/common/utils/calldata-decoder/decoders/specialized'
import { decodeAllPossibilities, decodeWithABI } from '@app/common/utils/calldata-decoder/decoders/abi'
import { fetchContractAbi, fetchFunctionInterface } from '@app/common/utils/calldata-decoder/api'

import { Logger } from '@nestjs/common'
import { ethers } from 'ethers'

const logger = new Logger('CallDataDecoder')

export async function decodeWithAddress ({
  calldata,
  address,
  chainId
}: {
    calldata: string;
    address: string;
    chainId: number;
}): Promise<ethers.utils.TransactionDescription | null> {
  try {
    const fetchedAbi = await fetchContractAbi({ address, chainId })
    const decodedFromAbi = decodeWithABI({
      abi: fetchedAbi.abi,
      calldata
    })
    if (decodedFromAbi) {
      return decodedFromAbi
    }
    const decodedWithSelector = await decodeWithSelector({ calldata })
    return decodedWithSelector
  } catch (error) {
    return null
  }
}

export async function decodeWithSelector ({
  calldata
}: {
    calldata: string;
}): Promise<ethers.utils.TransactionDescription | any | null> {
  try {
    return await _decodeWithSelector(calldata)
  } catch (error) {
    logger.error('Failed to decode with selector', error.stack)
    const decodingFunctions = [
      decodeSafeMultiSendTransactionsParam,
      decodeUniversalRouterPath,
      decodeABIEncodedData,
      decodeUniversalRouterCommands,
      decodeByGuessingFunctionFragment
    ]

    for (const decodeFn of decodingFunctions) {
      try {
        return await decodeFn(calldata)
      } catch (error) {
        logger.error(`Failed to decode with ${decodeFn.name}`, error.stack)
      }
    }
    return null
  }
}

const _decodeWithSelector = async (calldata: string) => {
  const selector = calldata.slice(0, 10)
  try {
    const fnInterface = await fetchFunctionInterface({ selector })
    if (!fnInterface) {
      throw new Error('No function interface found')
    }
    const decodedTransactions = decodeAllPossibilities({
      functionSignatures: [fnInterface],
      calldata
    })

    if (decodedTransactions.length === 0) {
      throw new Error('Failed to decode calldata with function signature')
    }

    const result = decodedTransactions[0]
    return result
  } catch (error) {
    logger.error(
            `Failed to find function interface for selector ${selector}`,
            error.stack
    )
    throw error
  }
}

export async function decodeRecursive ({
  calldata,
  address,
  chainId,
  abi
}: {
    calldata: string;
    address?: string;
    chainId?: number;
    abi?: ethers.utils.Fragment[] | string[];
}) {
  try {
    let parsedTransaction: ethers.utils.TransactionDescription | null
    if (abi) {
      parsedTransaction = decodeWithABI({ abi, calldata })
    } else if (address && chainId) {
      parsedTransaction = await decodeWithAddress({ calldata, address, chainId })
    } else {
      parsedTransaction = await decodeWithSelector({ calldata })
    }

    if (parsedTransaction) {
      return {
        functionName: parsedTransaction.name,
        signature: parsedTransaction.signature,
        rawArgs: parsedTransaction.args,
        args: await Promise.all(
          parsedTransaction.functionFragment.inputs.map(async (input, i) => {
            const value = parsedTransaction!.args[i]

            return {
              name: input.name,
              baseType: input.baseType,
              type: input.type,
              rawValue: value,
              value: await decodeParamTypes({
                input,
                value,
                address,
                chainId
              })
            }
          })
        )
      }
    } else {
      return null
    }
  } catch (error) {
    logger.error('Failed to decode recursively', error.stack)
    return null
  }
}

const decodeParamTypes = async ({
  input,
  value,
  address,
  chainId
}: {
    input: ethers.utils.ParamType;
    value: any;
    address?: string;
    chainId?: number;
}): Promise<any> => {
  if (input.baseType.includes('int')) {
    return ethers.BigNumber.from(value).toString()
  } else if (input.baseType === 'address') {
    return value
  } else if (input.baseType.includes('bytes')) {
    return await decodeBytesParam({ value, address, chainId })
  } else if (input.baseType === 'tuple') {
    return await decodeTupleParam({ input, value, address, chainId })
  } else if (input.baseType === 'array') {
    return await decodeArrayParam({ value, input, address, chainId })
  } else {
    return value
  }
}

const decodeBytesParam = async ({
  value,
  address,
  chainId
}: {
    value: any;
    address?: string;
    chainId?: number;
}) => {
  return {
    decoded: await decodeRecursive({ calldata: value, address, chainId })
  }
}

const decodeTupleParam = async ({
  input,
  value,
  address,
  chainId
}: {
    input: ethers.utils.ParamType;
    value: any;
    address?: string;
    chainId?: number;
}): Promise<any> => {
  if (!input.components) {
    return null
  }
  if (input.components.length === 0) {
    return null
  }

  return await Promise.all(
    input.components.map(async (component, i) => {
      return {
        name: component.name,
        baseType: component.baseType,
        type: component.type,
        rawValue: value[i],
        value: await decodeParamTypes({
          input: component,
          value: value[i],
          address,
          chainId
        })
      }
    })
  )
}

const decodeArrayParam = async ({
  value,
  input,
  address,
  chainId
}: {
    value: any;
    input: ethers.utils.ParamType;
    address?: string;
    chainId?: number;
}) => {
  if (!Array.isArray(value) || value.length === 0) {
    return []
  }
  return await Promise.all(
    value.map(async (v: any) => {
      return {
        name: input.arrayChildren!.name,
        baseType: input.arrayChildren!.baseType,
        type: input.arrayChildren!.type,
        rawValue: v,
        value: await decodeParamTypes({
          input: input.arrayChildren!,
          value: v,
          address,
          chainId
        })
      }
    })
  )
}
