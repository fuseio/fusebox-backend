import { ethers } from 'ethers'
import { Logger } from '@nestjs/common'
import {
  fetchContractAbiResponseSchema,
  fetchFunctionInterface4ByteSchema,
  fetchFunctionInterfaceOpenApiSchema
} from './schemas'

const logger = new Logger('CallDataAPI')

export async function fetchContractAbi ({
  address,
  chainId
}: {
    address: string;
    chainId: number;
}) {
  try {
    const response = await fetch(
            `https://anyabi.xyz/api/get-abi/${chainId}/${address}`
    )
    const data = await response.json()
    const parsedData = fetchContractAbiResponseSchema.parse(data)
    return {
      abi: parsedData.abi as ethers.utils.Fragment[],
      name: parsedData.name
    }
  } catch (error) {
    logger.error(`Failed to fetch contract ABI for address ${address} on chain ${chainId}`, error.stack)
    throw error
  }
}

export async function fetchFunctionInterface ({
  selector
}: {
    selector: string;
}): Promise<string | null> {
  try {
    const openChainData = await fetchFunctionFromOpenchain({ selector })

    let result: string | null = null
    if (openChainData) {
      result = openChainData[0].name
    } else {
      const fourByteData = await fetchFunctionFrom4Bytes({ selector })
      if (fourByteData) {
        result = fourByteData[0].text_signature
      }
    }

    return result
  } catch (error) {
    logger.error(`Failed to fetch function interface for selector ${selector}`, error.stack)
    throw error
  }
}

async function fetchFunctionFromOpenchain ({
  selector
}: {
    selector: string;
}) {
  try {
    const requestUrl = new URL(
      'https://api.openchain.xyz/signature-database/v1/lookup'
    )
    requestUrl.searchParams.append('function', selector)
    const response = await fetch(requestUrl)
    const data = await response.json()
    const parsedData = fetchFunctionInterfaceOpenApiSchema.parse(data)
    if (!parsedData.ok) {
      throw new Error(
                `Openchain API failed to find function interface with selector ${selector}`
      )
    }
    return parsedData.result.function[selector]
  } catch (error) {
    logger.error(`Failed to fetch function from Openchain for selector ${selector}`, error.stack)
    return null
  }
}

async function fetchFunctionFrom4Bytes ({ selector }: { selector: string; }) {
  try {
    const requestUrl = new URL(
      'https://www.4byte.directory/api/v1/signatures/'
    )
    requestUrl.searchParams.append('hex_signature', selector)
    const response = await fetch(requestUrl)
    const data = await response.json()
    const parsedData = fetchFunctionInterface4ByteSchema.parse(data)
    if (parsedData.count === 0) {
      throw new Error(
                `4bytes API failed to find function interface with selector ${selector}`
      )
    }
    return parsedData.results
  } catch (error) {
    logger.error(`Failed to fetch function from 4bytes for selector ${selector}`, error.stack)
    return null
  }
}
