import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { ApiKey } from './interfaces/api-keys.interface ';
import * as constants from './api-keys.constants';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import base64url from 'base64url';

@Injectable()
export class ApiKeysService {
  constructor(
    @Inject(constants.apiKeyModelString)
    private apiKeyModel: Model<ApiKey>,
  ) {}

  async createKeys(projectId: string) {
    const publicKey = `pk_${await this.generateRandomToken()}`;
    const secretKey = `sk_${await this.generateRandomToken()}`;
    const saltRounds = await bcrypt.genSalt();
    const secretHash = await bcrypt.hash(secretKey, saltRounds);
    const result = await this.apiKeyModel.findOneAndUpdate(
      { projectId: projectId },
      {
        publicKey: publicKey,
        secretHash: secretHash,
      },
      { upsert: true, new: true },
    );

    if (result) {
      return {
        publicKey: publicKey,
        secretKey: secretKey,
      };
    }

    throw new HttpException(
      'Internal Server Error',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  async createPublicKeys(projectId: string) {
    const projectKeys = await this.apiKeyModel.findOne({
      projectId: projectId,
    });

    if (projectKeys) {
      throw new HttpException('Public Keys already exist', HttpStatus.CONFLICT);
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

    throw new HttpException(
      'Internal Server Error',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  async getPublicKeys(projectId: string) {
    const apiKeys = await this.findOne(projectId);

    if (apiKeys && apiKeys?.publicKey) {
      return { publicKey: apiKeys?.publicKey };
    }

    throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
  }

  async findOne(projectId: string) {
    return await this.apiKeyModel.findOne({ projectId: projectId });
  }

  async generateSecretKeys(projectId: string) {
    const apiKeys = await this.apiKeyModel.findOne({ projectId: projectId });

    if (apiKeys && apiKeys?.secretHash) {
      throw new HttpException('Secret Key already exists', HttpStatus.CONFLICT);
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

    throw new HttpException(
      'Internal Server Error',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
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
    const newSecretKey = `pk_${await this.generateRandomToken()}`;
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

  private async generateRandomToken(): Promise<string> {
    const randomString = base64url(crypto.randomBytes(18));
    return randomString;
  }
}
