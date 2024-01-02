import { BigNumber, Wallet, ethers } from 'ethers';
import { Interface } from 'ethers/lib/utils';
import axios, { AxiosError, AxiosInstance } from 'axios';
import { Centrifuge } from 'centrifuge';
import EventEmitter from 'events';
import WebSocket from 'ws';
import { jwtDecode } from "jwt-decode";
import { websocketEvents } from '@app/smart-wallets-service/smart-wallets/constants/smart-wallets.constants';

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
  DEFAULT_GAS_LIMIT: process.env.DEFAULT_GAS_LIMIT ?? 700000,
  SOCKET_SERVER_URL: process.env.SOCKET_SERVER_URL ?? "wss://ws.fuse.io/connection/websocket"
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

class LegacyEventEmitter extends EventEmitter { }

export class FuseLegacySDK {
  private readonly _axios: AxiosInstance;
  private _credentials: Wallet;
  private _from: string;
  private _smartWalletsJwt: string;
  private _wallet: SmartWallet;
  private _socketClient = new Centrifuge(Variables.SOCKET_SERVER_URL);
  public events = new LegacyEventEmitter();

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
      await this._initWebsocket();
    } catch (error) {
      throw new Error(error);
    }

    try {
      this._wallet = await this.getWallet();
    } catch (error) {
      const createWallet = await this.createWallet();
      await createWallet.wait();

      this._wallet = await this.getWallet();
      if (!this._wallet.smartWalletAddress) {
        throw new Error("Couldn't retrieve smart wallet due to an invalid JWT. Please try again.");
      }
    }
  }

  private _initWebsocket = async (): Promise<void> => {
    try {
      const decodedJwt: any = jwtDecode(this._smartWalletsJwt);
      this._socketClient = new Centrifuge(
        Variables.SOCKET_SERVER_URL,
        {
          websocket: WebSocket,
          token: this._smartWalletsJwt,
          name: decodedJwt.sub
        }
      );
      this._socketClient.connect();
      await this._socketClient.ready()
    } catch (error) {
      this._throwError("Unable to establish legacy websocket connection with Centrifuge", error);
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

  private _throwError = (message: string, error: Error | AxiosError) => {
    let err: string | unknown = error.message;
    if (axios.isAxiosError(error))  {
      if (error.response) {
        err = error.response.data;
      } else if (error.request) {
        err = error.request;
      }
    }

    this._socketClient.disconnect();

    throw new Error(`${message} ${JSON.stringify(err)}`);
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

      const subscription = this._socketClient.newSubscription(`transaction:#${response.data.transactionId}`)
      subscription.on('publication', ctx => {
        this.events.emit(ctx.data.eventName, ctx.data.eventData)
      })

      return {
        data:response.data,
        wait: () => {
          return new Promise((resolve) => {
            this.events.once(websocketEvents.WALLET_CREATION_SUCCEEDED, (data) => {
              subscription.off('publication', () => {});
              resolve(data);
            });
          });
        }
      }
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
        value: amount.toString(),
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

      const subscription = this._socketClient.newSubscription(`transaction:#${response.data.transactionId}`)
      subscription.on('publication', ctx => {
        this.events.emit(ctx.data.eventName, ctx.data.eventData)
      })

      return {
        data: response.data,
        wait: () => {
          return new Promise((resolve, reject) => {
            this.events.once(websocketEvents.TRANSACTION_SUCCEEDED, (data) => {
              subscription.off('publication', () => {});
              this._socketClient.disconnect();
              resolve(data);
            });

            this.events.once(websocketEvents.TRANSACTION_FAILED, (data) => {
              subscription.off('publication', () => {});
              this._socketClient.disconnect();
              reject(new Error(`Couldn't process the legacy relay transaction. Please try again. ${JSON.stringify(data)}`));
            });
          });
        }
      }
    } catch (error) {
      this._throwError(
        "Unable to relay legacy transaction. Please try again.",
        error
      );
    }
  }
}
