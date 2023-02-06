import { Model } from 'mongoose'
import { SmartWalletsAuthDto } from '@app/smart-wallets-service/dto/smart-wallets-auth.dto'
import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { arrayify, computeAddress, hashMessage, recoverPublicKey } from 'nestjs-ethers'
import { ConfigService } from '@nestjs/config'
import { smartWalletString } from '@app/smart-wallets-service/smart-wallets/smart-wallets.constants'
import { SmartWallet } from '@app/smart-wallets-service/smart-wallets/interfaces/smart-wallets.interface'
import { generateSalt, generateTransactionId } from 'apps/charge-smart-wallets-service/src/common/utils/helper-functions'
import RelayAPIService from 'apps/charge-smart-wallets-service/src/common/services/relay-api.service'
import { RelayDto } from '@app/smart-wallets-service/smart-wallets/dto/relay.dto'
import { ISmartWalletUser } from '@app/common/interfaces/smart-wallet.interface'
import { Centrifuge } from 'centrifuge'

@Injectable()
export class SmartWalletsService {
  private readonly logger = new Logger(SmartWalletsService.name)

  constructor (
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly relayAPIService: RelayAPIService,
    private readonly centrifuge: Centrifuge,
    @Inject(smartWalletString)
    private smartWalletModel: Model<SmartWallet>
  ) { }

  async onModuleInit (): Promise<void> {
    this.start()
  }

  async start () {
    this.centrifuge.on('join', function (ctx) {
      console.log('join', ctx)
    })
    this.centrifuge.on('connecting', function (ctx) {
      console.log('connecting', ctx)
    })
    this.centrifuge.on('connected', function (ctx) {
      console.log('connected', ctx)
    })
    this.centrifuge.on('disconnected', function (ctx) {
      console.log('disconnected', ctx)
    })
    this.centrifuge.on('error', function (ctx) {
      console.log('error', ctx)
    })
    const sub = this.centrifuge.newSubscription('relayer', {
      token: process.env.CENTRIFUGO_RELAYER_CHANNEL_JWT
    })

    sub.on('publication', function (ctx) {
      console.log('publication')
      console.log(ctx.data)
    })

    sub.on('subscribing', function (ctx) {
      console.log('subscribing')
      console.log({ ...ctx })
    })

    sub.on('subscribed', function (ctx) {
      console.log('subscribed')
      console.log({ ...ctx })
    })

    sub.on('join', function (ctx) {
      console.log('join')
      console.log({ ...ctx })
    })

    sub.on('leave', function (ctx) {
      console.log('leave')
      console.log({ ...ctx })
    })

    sub.on('error', function (ctx) {
      console.log('error')
      console.log({ ...ctx })
    })

    sub.subscribe()
    this.centrifuge.connect()
  }

  get sharedAddresses () {
    return this.configService.get('sharedAddresses')
  }

  get wsUrl () {
    return this.configService.get('wsUrl')
  }

  async auth (smartWalletsAuthDto: SmartWalletsAuthDto) {
    try {
      const publicKey = recoverPublicKey(arrayify(hashMessage(arrayify(smartWalletsAuthDto.hash))), smartWalletsAuthDto.signature)
      const recoveredAddress = computeAddress(publicKey)

      if (recoveredAddress === smartWalletsAuthDto.ownerAddress) {
        // TODO: Centrigufo JWT claims: https://centrifugal.dev/docs/server/authentication#simplest-token
        const jwt = this.jwtService.sign({
          sub: recoveredAddress,
          info: {
            ownerAddress: recoveredAddress,
            projectId: smartWalletsAuthDto.projectId
          }
        })
        return { jwt }
      } else {
        throw new Error('Owner Address does not match recovered address in signature')
      }
    } catch (err) {
      this.logger.error(`An error occurred during Smart Wallets Auth. ${err}`)
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST)
    }
  }

  async getWallet (smartWalletUser: ISmartWalletUser) {
    const { ownerAddress } = smartWalletUser
    if (!await this.smartWalletModel.findOne({ ownerAddress })) {
      throw new Error('Not found')
    }
    return this.smartWalletModel.findOne({ ownerAddress }, {
      smartWalletAddress: 1,
      ownerAddress: 1,
      walletModules: 1,
      networks: 1,
      version: 1,
      paddedVersion: 1,
      _id: 0
    })
  }

  async createWallet (smartWalletUser: ISmartWalletUser) {
    try {
      const { ownerAddress } = smartWalletUser
      if (await this.smartWalletModel.findOne({ ownerAddress })) {
        throw new Error('Owner address already has a deployed smart wallet')
      }
      const salt = generateSalt()
      const transactionId = generateTransactionId(salt)
      const walletModules = this.sharedAddresses.walletModules
      this.relayAPIService.createWallet({
        v2: true,
        salt,
        transactionId,
        smartWalletUser,
        owner: ownerAddress,
        walletModules,
        WalletFactory: this.sharedAddresses.WalletFactory
      })
      return {
        connectionUrl: this.wsUrl,
        transactionId
      }
    } catch (err) {
      this.logger.error(`An error occurred during Smart Wallets Creation. ${err}`)
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST)
    }
  }

  async relay (relayDto: RelayDto) {
    try {
      const transactionId = generateTransactionId(relayDto.data)
      this.relayAPIService.relay({
        v2: true,
        transactionId,
        ...relayDto
      })
      return {
        connectionUrl: this.wsUrl,
        transactionId
      }
    } catch (err) {
      this.logger.error(`An error occurred during relay execution. ${err}`)
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST)
    }
  }

  // TODO
  async getAvailableUpgrades () {
  }

  // TODO
  async installUpgrade () {
  }
}
