import { ethers } from 'ethers'
import { Logger } from '@nestjs/common'

const logger = new Logger('ABIDecoder')

export function decodeWithABI ({
  abi,
  calldata
}: {
    abi: ethers.utils.Fragment[] | string[];
    calldata: string;
}): ethers.utils.TransactionDescription | null {
  try {
    const abiInterface = new ethers.utils.Interface(abi)
    const parsedTransaction = abiInterface.parseTransaction({ data: calldata })
    return parsedTransaction
  } catch (error) {
    logger.error('Failed to decode with ABI', error.stack)
    return null
  }
}

export function decodeAllPossibilities ({
  functionSignatures,
  calldata
}: {
    functionSignatures: string[];
    calldata: string;
}) {
  const results: ethers.utils.TransactionDescription[] = []
  for (const signature of functionSignatures) {
    try {
      const parsedTransaction = decodeWithABI({
        abi: [`function ${signature}`],
        calldata
      })
      if (parsedTransaction) {
        results.push(parsedTransaction)
      }
    } catch (error) {
      logger.error(
                `Failed to decode calldata with signature ${signature}`,
                error.stack
      )
    }
  }
  return results
}
