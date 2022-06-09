import { Inject, Injectable } from '@nestjs/common'
import { Model } from 'mongoose'
import { ApiKey } from 'apps/charge-api-service/src/api-keys/interfaces/api-keys.interface '
import { apiKeyModelString } from 'apps/charge-api-service/src/api-keys/api-keys.constants'
import * as bcrypt from 'bcryptjs'
import * as crypto from 'crypto'
import base64url from 'base64url'
import { RpcException } from '@nestjs/microservices'
import { StudioLegacyJwtService } from '@app/api-service/studio-legacy-jwt/studio-legacy-jwt.service'

@Injectable()
export class ApiKeysService {
  constructor (
    @Inject(apiKeyModelString)
    private apiKeyModel: Model<ApiKey>,
    private studioLegacyJwtService: StudioLegacyJwtService
  ) { }

  async createPublicKey (projectId: string) {
    const projectKeys = await this.apiKeyModel.findOne({
      projectId
    })

    if (projectKeys) {
      throw new RpcException('Public Keys already exist')
    }

    const publicKey = `pk_${await this.generateRandomToken()}`

    const result = await this.apiKeyModel.create({
      projectId,
      publicKey
    })

    if (result) {
      return {
        publicKey
      }
    }

    throw new RpcException('Internal Server Error')
  }

  async getPublicKey (projectId: string) {
    const apiKeys = await this.findOne({ projectId })

    if (apiKeys && apiKeys?.publicKey) {
      return { publicKey: apiKeys?.publicKey }
    }

    throw new RpcException('Not Found')
  }

  async findOne (query: object) {
    return this.apiKeyModel.findOne(query)
  }

  async createSecretKey (projectId: string) {
    const apiKeys = await this.apiKeyModel.findOne({ projectId })

    if (apiKeys && apiKeys?.secretHash) {
      throw new RpcException('Secret Key already exists')
    }

    const { secretKey, secretPrefix, secretLastFourChars } = await this.generateSecretKey()
    const saltRounds = await bcrypt.genSalt()
    const secretHash = await bcrypt.hash(secretKey, saltRounds)

    const encryptedLegacyJwt = await this.studioLegacyJwtService.createLegacyJwt(`chargeApp_${projectId}`)

    const result = await this.apiKeyModel.findOneAndUpdate(
      { projectId },
      {
        secretHash,
        secretPrefix,
        secretLastFourChars,
        encryptedLegacyJwt
      },
      { upsert: true, new: true }
    )

    if (result) {
      return {
        secretKey
      }
    }

    throw new RpcException('Internal Server Error')
  }

  async updateSecretKey (projectId: string) {
    const { secretKey, secretPrefix, secretLastFourChars } = await this.generateSecretKey()
    const saltRounds = await bcrypt.genSalt()
    const secretHash = await bcrypt.hash(secretKey, saltRounds)

    const result = await this.apiKeyModel.findOneAndUpdate(
      {
        projectId
      },
      {
        secretHash,
        secretPrefix,
        secretLastFourChars
      },
      { upsert: true, new: true }
    )

    if (result) {
      return {
        secretKey
      }
    }
  }

  async getApiKeysInfo (projectId: string) {
    const projectApiKeys = await this.apiKeyModel.findOne({
      projectId
    })
      .select('-secretHash -encryptedLegacyJwt')

    return projectApiKeys || {}
  }

  private async generateRandomToken (): Promise<string> {
    const randomString = base64url(crypto.randomBytes(18))
    return randomString
  }

  private async generateSecretKey () {
    const secretPrefix = 'sk_'
    const secretKey = `${secretPrefix}${await this.generateRandomToken()}`
    const secretLastFourChars = secretKey.slice(secretKey.length - 4)
    return { secretKey, secretPrefix, secretLastFourChars }
  }
}
