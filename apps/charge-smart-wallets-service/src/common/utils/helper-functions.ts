import { BigNumber, defaultAbiCoder, randomBytes } from 'nestjs-ethers'
import { createHash } from 'crypto'

const randomInteger = (
  min: number,
  max: number
): number => Math.floor(Math.random() * (max - min + 1)) + min

export function generateSalt () {
  return BigNumber.from(randomBytes(32)).toHexString()
}

export function generateTransactionId (data) {
  return `0x${createHash('sha256').update(data + Date.now() + randomInteger(1, 1000)).digest('hex')}`
}
export function decodePaymasterAndData (data: string): any {
  const paymasterAddress = data.slice(0, 42)
  const encodedDataWithPrefix = '0x' + data.slice(42, data.length - 130)
  const decodedData = defaultAbiCoder.decode(
    ['uint48', 'uint48', 'uint256', 'bytes'],
    encodedDataWithPrefix
  )
  return {
    paymasterAddress,
    sponsorId: decodedData[2].toString()
  }
}
