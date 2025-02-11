import { Hex } from 'viem'

export const startHexWith0x = (hexValue?: string): Hex => {
  return hexValue
    ? hexValue.startsWith('0x')
      ? hexValue === '0x'
        ? '0x'
        : (hexValue as Hex)
      : `0x${hexValue}`
    : '0x'
}
