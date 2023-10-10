import { formatUnits } from 'nestjs-ethers'
// import { TokenService } from '@app/smart-wallets-service/common/services/token.service'
import { TokenService } from '../../../common/services/token.service'
export default abstract class WalletAction {
  protected tokenService: TokenService

  setTokenService(tokenService: TokenService): void {
    this.tokenService = tokenService
  }

  async execute(parsedUserOp: Record<string, any>): Promise<any> {
    return parsedUserOp
  }

  descGenerator(data: any): string {
    return `${data.action} ${formatUnits(data.valueInWei, data.decimals)} ${data.symbol}`
  }

  generateDescription(data: any) {
    return this.descGenerator(data)
  }
}
