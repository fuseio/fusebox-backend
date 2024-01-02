import { FuseSDK } from '@fuseio/fusebox-web-sdk';
import { ethers } from 'ethers';
import { parseEther } from 'nestjs-ethers';
import { FuseLegacySDK } from '@scripts/fuseLegacySDK';

export class TransferToken {
  private _privateKey: string;
  private _to: string;
  private _eth: string;

  constructor(privateKey: string, to: string, eth: string = "0.001") {
    this._privateKey = privateKey;
    this._to = to;
    this._eth = eth;
  }

  accountAbstraction = async () => {
    try {
      const credentials = new ethers.Wallet(this._privateKey);
      const publicApiKey = process.env.PUBLIC_API_KEY;
      const fuseSDK = await FuseSDK.init(publicApiKey, credentials, { withPaymaster: true });

      const value = parseEther(this._eth);
      const data = Uint8Array.from([]);
      const res = await fuseSDK.callContract(this._to, value, data);
      await res?.wait();

      return res;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  legacy = async () => {
    try {
      const credentials = new ethers.Wallet(this._privateKey);
      const publicApiKey = process.env.PUBLIC_API_KEY;
      const fuseLegacySDK = new FuseLegacySDK(publicApiKey);
      await fuseLegacySDK.init(credentials);

      const value = parseEther(this._eth);
      const res = await fuseLegacySDK.relay(this._to, value);

      return await res.wait();
    } catch (error) {
      throw new Error(error.message);
    }
  };
}
