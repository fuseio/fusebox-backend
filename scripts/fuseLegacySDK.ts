import { BigNumber, Wallet, ethers } from 'ethers';
import { Interface } from 'ethers/lib/utils';
import axios, { AxiosInstance } from 'axios';

type WalletModuleAddresses = {
  GuardianManager: string;
  LockManager: string;
  RecoveryManager: string;
  ApprovedTransfer: string;
  TransferManager: string;
  NftTransfer: string;
  TokenExchanger: string;
  CommunityManager: string;
  WalletOwnershipManager: string;
};

type SmartWallet = {
  smartWalletAddress: string;
  walletModules: WalletModuleAddresses;
  networks: string[];
  version: string;
  paddedVersion: string;
  ownerAddress: string;
};

const Variables = {
  FUSE_API_BASE_URL: process.env.FUSE_API_BASE_URL ?? "https://api.fuse.io",
  DEFAULT_GAS_LIMIT: process.env.DEFAULT_GAS_LIMIT ?? 700000
}

const ABI = {
  "constant": false,
  "inputs": [
    {
      "name": "_wallet",
      "type": "address"
    },
    {
      "name": "_token",
      "type": "address"
    },
    {
      "name": "_to",
      "type": "address"
    },
    {
      "name": "_amount",
      "type": "uint256"
    },
    {
      "name": "_data",
      "type": "bytes"
    }
  ],
  "name": "transferToken",
  "outputs": [],
  "payable": false,
  "stateMutability": "nonpayable",
  "type": "function"
}

export class FuseLegacySDK {
  private readonly _axios: AxiosInstance;
  private _credentials: Wallet;
  private _from: string;
  private _smartWalletsJwt: string;
  private _wallet: SmartWallet;

  constructor(public readonly publicApiKey: string) {
    this._axios = axios.create({
      baseURL: `${Variables.FUSE_API_BASE_URL}/api`,
      headers: {
        'Content-Type': 'application/json',
      },
      params: {
        apiKey: publicApiKey,
      },
    });
  }

  init = async (
    credentials: Wallet
  ) => {
    this._credentials = credentials;

    try {
      this._from = await credentials.getAddress();
      const { hash, signature } = await this._signer(this._credentials, this._from);
      this._smartWalletsJwt = await this.authenticate(hash, signature, this._from);
    } catch (error) {
      throw new Error(error);
    }

    try {
      this._wallet = await this.getWallet();
    } catch (error) {
      await this.createWallet();

      const oneMinuteInMilliseconds = 60000;
      await this._sleep(oneMinuteInMilliseconds);

      this._wallet = await this.getWallet();
      if (!this._wallet.smartWalletAddress) {
        throw new Error("Couldn't retrieve smart wallet due to an invalid JWT. Please try again.");
      }
    }
  }

  private _signer = async (
    credentials: ethers.Signer,
    ownerAddress: string
  ): Promise<{ signature: string, hash: string }> => {
    const input = Uint8Array.from(Buffer.from(ownerAddress.replace('0x', ''), 'hex'));
    const hash = ethers.utils.keccak256(input);
    const signature = await credentials.signMessage(ethers.utils.arrayify(hash));
    return { hash, signature };
  };

  private _signOffChain = (
    credentials: Wallet,
    from: string,
    to: string,
    data: string,
    nonce: string,
    options?: {
      value?: BigNumber;
      gasPrice?: BigNumber;
      gasLimit?: BigNumber;
    }
  ): Promise<string> => {
    const value = options?.value ?? BigNumber.from(0);
    const gasPrice = options?.gasPrice ?? BigNumber.from(0);
    const gasLimit =
      options?.gasLimit ?? BigNumber.from(Variables.DEFAULT_GAS_LIMIT);

    const inputArr = [
      '0x19',
      '0x00',
      from,
      to,
      ethers.utils.hexZeroPad(ethers.utils.hexlify(value), 32),
      data,
      nonce,
      ethers.utils.hexZeroPad(ethers.utils.hexlify(gasPrice), 32),
      ethers.utils.hexZeroPad(ethers.utils.hexlify(gasLimit), 32),
    ];

    const input = `0x${inputArr.map((hexStr) => hexStr.slice(2)).join('')}`;

    const messagePayload = ethers.utils.keccak256(ethers.utils.arrayify(input));
    const signature = credentials.signMessage(messagePayload);

    return signature;
  }


  private _getNonce = async (): Promise<string> => {
    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);

    const block = await provider.getBlockNumber();
    const timestamp = Date.now();

    const blockHex = ethers.utils.hexZeroPad(ethers.utils.hexlify(block), 16);
    const timestampHex = ethers.utils.hexZeroPad(ethers.utils.hexlify(timestamp), 16);

    const combinedHex = blockHex.substring(2) + timestampHex.substring(2);

    return ethers.utils.hexlify(ethers.utils.arrayify('0x' + combinedHex));
  }

  private _encodedDataForContractCall = (abi: any, methodName: string, values: any[]) => {
    const iface = new Interface([abi]);
    return iface.encodeFunctionData(methodName, values)
  }

  private _throwError = (message: string, error: any) => {
    throw new Error(`${message} ${JSON.stringify(error)}`);
  }

  private _sleep = (millisecond: number): Promise<unknown> => {
    return new Promise(resolve => setTimeout(resolve, millisecond));
  }

  authenticate = async (
    hash: string,
    signature: string,
    ownerAddress: string
  ) => {
    try {
      const response = await this._axios.post('/v1/smart-wallets/auth', {
        hash,
        signature,
        ownerAddress
      });
      return response.data.jwt;
    } catch (error) {
      this._throwError(
        "Unable to authenticate legacy smart wallet. Please try again.",
        error
      );
    }
  }

  createWallet = async () => {
    try {
      const response = await this._axios.post('/v1/smart-wallets/create', {}, {
        headers: {
          'Authorization': `Bearer ${this._smartWalletsJwt}`
        }
      });
      return response.data;
    } catch (error) {
      this._throwError(
        "Couldn't create a legacy smart wallet. Please try again.",
        error
      );
    }
  }

  getWallet = async (): Promise<SmartWallet> => {
    try {
      const response = await this._axios.get('/v1/smart-wallets', {
        headers: {
          'Authorization': `Bearer ${this._smartWalletsJwt}`
        }
      });
      return response.data;
    } catch (error) {
      this._throwError(
        "Unable to retrieve legacy smart wallet. Please try again.",
        error
      );
    }
  }

  relay = async (
    to: string,
    amount: BigNumber
  ) => {
    try {
      const walletModule = "TransferManager";
      const methodName = "transferToken";
      const tokenAddress = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
      const transactionData = "0x";
      const nonce = await this._getNonce();
      const data = this._encodedDataForContractCall(ABI, methodName, [
        this._wallet.smartWalletAddress,
        tokenAddress,
        to,
        amount,
        transactionData
      ]);
      const signature = await this._signOffChain(
        this._credentials,
        this._wallet.walletModules.TransferManager,
        this._wallet.smartWalletAddress,
        data,
        nonce
      )
      const transactionBody = {
        status: "pending",
        from: this._wallet.smartWalletAddress,
        to,
        value: amount,
        type: "SEND",
        asset: "FUSE",
        tokenName: "FuseToken",
        tokenSymbol: "FUSE",
        tokenDecimal: 18,
        tokenAddress
      }

      const body = {
        gasPrice: 0,
        gasLimit: 700000,
        relayBody: null,
        txMetadata: null,
        transactionBody,
        walletAddress: this._wallet.smartWalletAddress,
        walletModuleAddress: this._wallet.walletModules.TransferManager,
        data,
        nonce,
        methodName,
        signature: signature,
        walletModule
      };

      const response = await this._axios.post('/v1/smart-wallets/relay', body, {
        headers: {
          'Authorization': `Bearer ${this._smartWalletsJwt}`
        },
      });
      return response.data;
    } catch (error) {
      this._throwError(
        "Unable to relay legacy transaction. Please try again.",
        error
      );
    }
  }
}
