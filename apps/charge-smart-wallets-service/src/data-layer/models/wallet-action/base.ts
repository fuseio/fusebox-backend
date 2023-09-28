import { formatUnits } from 'nestjs-ethers'

export default abstract class WalletAction {
  async execute (parsedUserOp: Record<string, any>): Promise<any> {
    return parsedUserOp
  }

  descGenerator (data: any): string {
    return `${data.action} ${formatUnits(data.valueInWei, data.decimals)} ${data.symbol}`
  }

  generateDescription (data: any) {
    return this.descGenerator(data)
  }
}
