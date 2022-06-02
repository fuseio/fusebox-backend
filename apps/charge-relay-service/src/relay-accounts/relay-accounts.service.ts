import { Inject, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Model } from 'mongoose';
import { relayAccountModelString } from '@app/relay-service/relay-accounts/relay-accounts.constants';
import { RelayAccount } from '@app/relay-service/relay-accounts/interfaces/api-keys.interface ';

@Injectable()
export class RelayAccountsService {
  constructor(
    @Inject(relayAccountModelString)
    private relayAccountModel: Model<RelayAccount>,
  ) {}

  async createAccount(projectId: string) {
    const account = await this.relayAccountModel.findOne({ projectId });

    if (account) {
      throw new RpcException('Account already assigned to this project Id');
    }

    return {
      account,
    };

    // const secretKey = `sk_${await this.generateRandomToken()}`;
    // const saltRounds = await bcrypt.genSalt();
    // const secretHash = await bcrypt.hash(secretKey, saltRounds);

    // const result = await this.apiKeyModel.findOneAndUpdate(
    //   { projectId: projectId },
    //   {
    //     secretHash: secretHash,
    //   },
    //   { upsert: true, new: true },
    // );

    // if (result) {
    //   return {
    //     secretKey: secretKey,
    //   };
    // }

    // throw new RpcException('Internal Server Error');
  }
}
