import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ethers } from 'ethers'
import { AuthOperatorDto } from '@app/accounts-service/operators/dto/auth-operator.dto'
import paymasterAbi from '@app/api-service/paymaster-api/abi/FuseVerifyingPaymasterSingleton.abi.json'
import etherspotWalletFactoryAbi from '@app/accounts-service/operators/abi/EtherspotWalletFactory.abi.json'
import { ConfigService } from '@nestjs/config'
import { CreateOperatorWalletDto } from '@app/accounts-service/operators/dto/create-operator-wallet.dto'
import { OperatorWallet } from '@app/accounts-service/operators/interfaces/operator-wallet.interface'
import { operatorWalletModelString } from '@app/accounts-service/operators/operators.constants'
import { Model, ObjectId } from 'mongoose'
import { WebhookEvent } from '@app/apps-service/payments/interfaces/webhook-event.interface'

@Injectable()
export class OperatorsService {
  constructor (
    private readonly jwtService: JwtService,
    private configService: ConfigService,
    @Inject(operatorWalletModelString)
    private operatorWalletModel: Model<OperatorWallet>
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

  async fundPaymaster (sponsorId: string, amount: string, ver: string, environment: string): Promise<any> {
    const paymasterEnvs = this.configService.getOrThrow(`paymaster.${ver}`)
    const contractAddress = paymasterEnvs[environment].paymasterContractAddress
    const privateKey = this.configService.get('PAYMASTER_FUNDER_PRIVATE_KEY')

    const provider = new ethers.providers.JsonRpcProvider(paymasterEnvs[environment].url)
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

  async predictWallet (owner: string, index: number, ver: string, environment: string): Promise<string> {
    const paymasterEnvs = this.configService.getOrThrow(`paymaster.${ver}`)
    const contractAddress = paymasterEnvs[environment].etherspotWalletFactoryContractAddress

    const provider = new ethers.providers.JsonRpcProvider(paymasterEnvs[environment].url)
    const contract = new ethers.Contract(contractAddress, etherspotWalletFactoryAbi, provider)

    try {
      return await contract.getAddress(owner, index)
    } catch (error) {
      throw new InternalServerErrorException(`getAddress predictWallet error: ${error}`)
    }
  }

  async createWallet (createOperatorWalletDto: CreateOperatorWalletDto): Promise<OperatorWallet> {
    const createdOperatorWallet = new this.operatorWalletModel(createOperatorWalletDto)
    return createdOperatorWallet.save()
  }

  async findWallet (key: string, value: string): Promise<OperatorWallet> {
    return this.operatorWalletModel.findOne({ [key]: value })
  }

  async updateIsActivated (_id: ObjectId, isActivated: boolean): Promise<any> {
    return this.operatorWalletModel.updateOne({ _id }, { isActivated })
  }

  async getBalance (address: string, ver: string, environment: string): Promise<string> {
    const paymasterEnvs = this.configService.getOrThrow(`paymaster.${ver}`)
    const provider = new ethers.providers.JsonRpcProvider(paymasterEnvs[environment].url)
    try {
      const balance = await provider.getBalance(address)
      return ethers.utils.formatEther(balance)
    } catch (error) {
      throw new InternalServerErrorException(`getBalance error: ${error}`)
    }
  }

  async handleWebhook (webhookEvent: WebhookEvent): Promise<{address: string, valueEth: string} | undefined> {
    if (
      webhookEvent.direction !== 'incoming' ||
      webhookEvent.tokenType !== 'FUSE'
    ) {
      return
    }

    return {
      address: webhookEvent.to,
      valueEth: webhookEvent.valueEth
    }
  }
}
