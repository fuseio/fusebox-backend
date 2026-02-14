import { PipeTransform, BadRequestException } from '@nestjs/common'
import { isEthereumAddress } from 'class-validator'

export class ParseAddressPipe implements PipeTransform<string> {
  constructor (private readonly optional = false) {}

  transform (value: string): string {
    if (!value) {
      if (this.optional) return value
      throw new BadRequestException('Ethereum address is required')
    }

    const trimmed = value.trim()
    if (!isEthereumAddress(trimmed)) {
      throw new BadRequestException(`Invalid Ethereum address: ${trimmed}`)
    }
    return trimmed.toLowerCase()
  }
}
