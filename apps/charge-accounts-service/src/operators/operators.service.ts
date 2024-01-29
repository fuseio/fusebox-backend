import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ethers } from 'ethers'
import { AuthOperatorDto } from '@app/accounts-service/operators/dto/auth-operator.dto'
import { PrdOrSbxKeyRequest } from '@app/accounts-service/operators/interfaces/production-or-sandbox-key.interface'
import paymasterAbi from '@app/api-service/paymaster-api/abi/FuseVerifyingPaymasterSingleton.abi.json'
import etherspotWalletFactoryAbi from '@app/accounts-service/operators/abi/EtherspotWalletFactory.abi.json'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class OperatorsService {
  constructor (
    private readonly jwtService: JwtService,
    private configService: ConfigService
  ) { }

  verifySignature (authOperatorDto: AuthOperatorDto): string {
    const recoveredAddress = ethers.utils.verifyMessage(authOperatorDto.message, authOperatorDto.signature)
    return recoveredAddress
  }

  async createJwt (address: string): Promise<string> {
    return this.jwtService.sign({
      sub: address
    })
  }

  async fundPaymaster (sponsorId: string, amount: string, ver: string, request: PrdOrSbxKeyRequest): Promise<any> {
    const paymasterEnvs = this.configService.getOrThrow(`paymaster.${ver}`)
    const contractAddress = paymasterEnvs[request.environment].paymasterContractAddress
    const privateKey = this.configService.get('PAYMASTER_FUNDER_PRIVATE_KEY')

    const provider = new ethers.providers.JsonRpcProvider(paymasterEnvs[request.environment].url)
    const wallet = new ethers.Wallet(privateKey, provider)
    const contract = new ethers.Contract(contractAddress, paymasterAbi, wallet)
    const ether = ethers.utils.parseEther(amount)

    try {
      const tx = await contract.depositFor(sponsorId, { value: ether })
      return await tx.wait()
    } catch (error) {
      throw new InternalServerErrorException(`depositFor fund paymaster error: ${error}`)
    }
  }

  async getSmartWalletsAA (owner: string, index: number, ver: string, request: PrdOrSbxKeyRequest): Promise<string> {
    const paymasterEnvs = this.configService.getOrThrow(`paymaster.${ver}`)
    const contractAddress = paymasterEnvs[request.environment].etherspotWalletFactoryContractAddress

    const provider = new ethers.providers.JsonRpcProvider(paymasterEnvs[request.environment].url)
    const contract = new ethers.Contract(contractAddress, etherspotWalletFactoryAbi, provider)

    try {
      return await contract.getAddress(owner, index)
    } catch (error) {
      throw new InternalServerErrorException(`getAddress smart wallets AA error: ${error}`)
    }
  }
}
