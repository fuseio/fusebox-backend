import { BigNumber, randomBytes } from 'nestjs-ethers'

export function generateSalt () {
  return BigNumber.from(randomBytes(32)).toHexString()
}
