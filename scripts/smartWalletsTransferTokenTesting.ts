import { ethers } from 'ethers';
import { FuseSDK } from '@fuseio/fusebox-web-sdk';
import { parseEther } from 'ethers/lib/utils';

export const transferToken = async (
  privateKey: string,
  to: string,
  eth: string = "0.001"
) => {
  try {
    const credentials = new ethers.Wallet(privateKey as string);
    const publicApiKey = process.env.PUBLIC_API_KEY as string;
    const fuseSDK = await FuseSDK.init(publicApiKey, credentials, { withPaymaster: true });

    const value = parseEther(eth);
    const data = Uint8Array.from([]);
    const res = await fuseSDK.callContract(to, value, data);
    await res?.wait();
    
    return res;
  } catch (error) {
    throw new Error(error.message);
  }
};
