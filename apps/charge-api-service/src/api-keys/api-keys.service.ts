import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { ApiKey } from 'apps/charge-api-service/src/api-keys/interfaces/api-keys.interface ';
import { apiKeyModelString } from 'apps/charge-api-service/src/api-keys/api-keys.constants';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import base64url from 'base64url';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ApiKeysService {
  constructor(
    @Inject(apiKeyModelString)
    private apiKeyModel: Model<ApiKey>,
  ) {}

  async createPublicKey(projectId: string) {
    const projectKeys = await this.apiKeyModel.findOne({
      projectId: projectId,
    });

    if (projectKeys) {
      throw new RpcException('Public Keys already exist');
    }

    const publicKey = `pk_${await this.generateRandomToken()}`;

    const result = await this.apiKeyModel.create({
      projectId: projectId,
      publicKey: publicKey,
    });

    if (result) {
      return {
        publicKey: publicKey,
      };
    }

    throw new RpcException('Internal Server Error');
  }

  async getPublicKey(projectId: string) {
    const apiKeys = await this.findOne(projectId);

    if (apiKeys && apiKeys?.publicKey) {
      return { publicKey: apiKeys?.publicKey };
    }

    throw new RpcException('Not Found');
  }

  async findOne(projectId: string) {
    return this.apiKeyModel.findOne({ projectId: projectId, isTest: false });
  }

  async createSecretKey(projectId: string) {
    const apiKeys = await this.apiKeyModel.findOne({ projectId });

    if (apiKeys && apiKeys?.secretHash) {
      throw new RpcException('Secret Key already exists');
    }

    const secretKey = `sk_${await this.generateRandomToken()}`;
    const saltRounds = await bcrypt.genSalt();
    const secretHash = await bcrypt.hash(secretKey, saltRounds);

    const result = await this.apiKeyModel.findOneAndUpdate(
      { projectId: projectId },
      {
        secretHash: secretHash,
      },
      { upsert: true, new: true },
    );

    if (result) {
      return {
        secretKey: secretKey,
      };
    }

    throw new RpcException('Internal Server Error');
  }

  async updatePublicKey(projectId: string) {
    const newPublicKey = `pk_${await this.generateRandomToken()}`;

    const result = await this.apiKeyModel.findOneAndUpdate(
      {
        projectId: projectId,
      },
      {
        publicKey: newPublicKey,
      },
      { upsert: true, new: true },
    );

    if (result) {
      return {
        publicKey: newPublicKey,
      };
    }
  }

  async updateSecretKey(projectId: string) {
    const newSecretKey = `sk_${await this.generateRandomToken()}`;
    const saltRounds = await bcrypt.genSalt();
    const newSecretHash = await bcrypt.hash(newSecretKey, saltRounds);

    const result = await this.apiKeyModel.findOneAndUpdate(
      {
        projectId: projectId,
      },
      {
        secretHash: newSecretHash,
      },
      { upsert: true, new: true },
    );

    if (result) {
      return {
        secretKey: newSecretKey,
      };
    }
  }

  async checkIfSecretExists(projectId: string): Promise<boolean> {
    const projectApiKeys = await this.apiKeyModel.findOne({
      projectId: projectId,
    });

    if (projectApiKeys?.secretHash) {
      return true;
    }

    return false;
  }

  private async generateRandomToken(): Promise<string> {
    const randomString = base64url(crypto.randomBytes(18));
    return randomString;
  }
}
