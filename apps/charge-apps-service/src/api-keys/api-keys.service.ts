import { ApiKey } from '@app/apps-service/api-keys/interfaces/api-keys.interface '
import { apiKeyModelString } from '@app/apps-service/api-keys/api-keys.constants'
import { Inject, Injectable } from '@nestjs/common'
import { Model } from 'mongoose'
import { RpcException } from '@nestjs/microservices'
import { isEmpty } from 'lodash'
import * as bcrypt from 'bcryptjs'
import * as crypto from 'crypto'
import base64url from 'base64url'
import { ApiKeysDto } from '@app/apps-service/api-keys/dto/api-keys.dto'

@Injectable()
export class ApiKeysService {
  constructor (
        @Inject(apiKeyModelString)
        private apiKeyModel: Model<ApiKey>
  ) { }

  async createPublicKey (apiKeysDto: ApiKeysDto) {
    const [ownerId, appName] = [apiKeysDto.ownerId, apiKeysDto.appName]

    const appKeys = await this.apiKeyModel.findOne({
      ownerId, appName
    })

    if (appKeys) {
      throw new RpcException('Public Keys already exist')
    }

    const publicKey = `pk_${await this.generateRandomToken()}`

    const result = await this.apiKeyModel.create({
      ownerId,
      appName,
      publicKey
    })

    if (result) {
      return {
        publicKey
      }
    }

    throw new RpcException('Internal Server Error')
  }

  async getPublicKey (apiKeysDto: ApiKeysDto) {
    const [ownerId, appName] = [apiKeysDto.ownerId, apiKeysDto.appName]

    const apiKeys = await this.findOne({ ownerId, appName })

    if (apiKeys && apiKeys?.publicKey) {
      return { publicKey: apiKeys?.publicKey }
    }

    throw new RpcException('Not Found')
  }

  async findOne (query: Record<string, any>) {
    return this.apiKeyModel.findOne(query)
  }

  async createSecretKey (apiKeysDto: ApiKeysDto) {
    const [ownerId, appName] = [apiKeysDto.ownerId, apiKeysDto.appName]

    const apiKeys = await this.apiKeyModel.findOne({ ownerId, appName })

    if (apiKeys && apiKeys?.secretHash) {
      throw new RpcException('Secret Key already exists')
    }

    const { secretKey, secretPrefix, secretLastFourChars } = await this.generateSecretKey()
    const saltRounds = await bcrypt.genSalt()
    const secretHash = await bcrypt.hash(secretKey, saltRounds)

    const result = await this.apiKeyModel.findOneAndUpdate(
      { ownerId, appName },
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

    throw new RpcException('Internal Server Error')
  }

  async updateSecretKey (apiKeysDto: ApiKeysDto) {
    const [ownerId, appName] = [apiKeysDto.ownerId, apiKeysDto.appName]

    const { secretKey, secretPrefix, secretLastFourChars } = await this.generateSecretKey()
    const saltRounds = await bcrypt.genSalt()
    const secretHash = await bcrypt.hash(secretKey, saltRounds)

    const result = await this.apiKeyModel.findOneAndUpdate(
      {
        ownerId, appName
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

  async getOwnerIdByPublicKey (publicKey: any) {
    const projectApiKeys: ApiKey | null = await this.apiKeyModel.findOne({ publicKey })
    const ownerId: string = projectApiKeys?.ownerId?.toString()

    if (isEmpty(ownerId)) {
      return new Error('Project not found')
    }

    return ownerId
  }

  async getApiKeysInfo (apiKeysDto: ApiKeysDto) {
    const [ownerId, appName] = [apiKeysDto.ownerId, apiKeysDto.appName]

    const projectApiKeys = await this.apiKeyModel.findOne({
      ownerId, appName
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
