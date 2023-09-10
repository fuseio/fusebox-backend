import { BigNumber, randomBytes } from 'nestjs-ethers'
import { createHash } from 'crypto'

const randomInteger = (
  min: number,
  max: number
): number => Math.floor(Math.random() * (max - min + 1)) + min

export function generateSalt() {
  return BigNumber.from(randomBytes(32)).toHexString()
}

export function generateTransactionId(data) {
  return `0x${createHash('sha256').update(data + Date.now() + randomInteger(1, 1000)).digest('hex')}`
}
