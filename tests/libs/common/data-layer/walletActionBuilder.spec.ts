import { expect } from "@jest/globals";
import { UserOpFactory } from "@app/smart-wallets-service/common/services/user-op-factory.service";
import { UserOpParser } from "@app/smart-wallets-service/common/services/user-op-parser.service";
import { parsedUserOpToWalletAction } from "@app/smart-wallets-service/common/utils/wallet-action-factory";
import { TokenService } from "@app/smart-wallets-service/common/services/token.service";
import Web3ProviderService from "@app/common/services/web3-provider.service";
import { ConfigService } from '@nestjs/config';
import * as walletActionsExamples from './consts/walletActionsExamples';
import { Test, TestingModule } from '@nestjs/testing';
import {
    NATIVE_TRANSFER_CALLDATA,
    ERC20_CALLDATA,
    APPROVE_TOKEN_CALLDATA,
    STAKE_NATIVE_TOKENS_CALLDATA,
    UNSTAKE_NATIVE_TOKENS_CALLDATA,
    ERC_20_STAKE_CALLDATA,
    ERC_20_UNSTAKE_CALLDATA,
    SWAP_EXACT_ETH_FOR_TOKENS_CALLDATA,
    SWAP_ETH_FOR_EXACT_TOKENS_CALLDATA,
    SWAP_EXACT_TOKENS_FOR_ETH_CALLDATA,
    SWAP_TOKENS_FOR_EXACT_ETH_CALLDATA,
    SWAP_EXACT_TOKENS_TO_TOKENS_CALLDATA,
    SWAP_TOKENS_TO_EXACT_TOKENS_CALLDATA,
    BATCH_TRANSACTION_CALLDATA_ONLY_ERC20_TOKENS,
    BATCH_TRANSACTION_CALLDATA,
    TRANSFER_NFT_CALLDATA
} from './consts/calldataExamples';
import { BigNumber } from "ethers"

const basicUserOp = {
    "sender": "0x5bbea139c1b1b32cf7b5c7fd1d1ff802de006117",
    "nonce": "0x57",
    "initCode": "0x",
    "callData": "0x",
    "callGasLimit": "0x5cc3",
    "verificationGasLimit": "0x148f0",
    "preVerificationGas": "0xae28",
    "maxFeePerGas": "0x2e4e2bf80",
    "maxPriorityFeePerGas": "0x2e4e2bf80",
    "paymasterAndData": "0x",
    "signature": "0x0214a6ac4c09b14982243ee8de9f7ac66951d92cea9afc3b6b3134cf9c02744f4715706c3ddac8ffe4978a34c0ca50cb461ca9629c7dfe4a29cbb3de0aef2d831b",
    "userOpHash": "0x111",
    "paymaster": "0x",
    "success": false,
    "actualGasCost": 0,
    "actualGasUsed": 0
}

const config = {
    rpcConfig: {
        rpc: {
            url: process.env.RPC_URL || 'https://rpc.fuse.io'
        }
    }
}

describe("DataLayerService Tests", () => {
    let userOpFactory: UserOpFactory;
    let tokenService: TokenService;
    let configService: ConfigService
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserOpFactory,
                UserOpParser,
                TokenService,
                {
                    provide: ConfigService,
                    useValue: {
                        get: () => ({

                            rpc: {
                                url: process.env.RPC_URL || 'https://rpc.fuse.io'
                            }

                        })
                    }
                },
                Web3ProviderService,
            ],
        }).compile();

        userOpFactory = module.get<UserOpFactory>(UserOpFactory);
        tokenService = module.get<TokenService>(TokenService);
        configService = module.get<ConfigService>(ConfigService);

        // Set the config for the Web3ProviderService
        const web3ProviderService = module.get<Web3ProviderService>(Web3ProviderService);
        web3ProviderService.setConfig(configService.get('rpc.url'));

    });

    test("native token transfer", async () => {
        basicUserOp.callData = NATIVE_TRANSFER_CALLDATA;
        const userOp = await userOpFactory.createUserOp(basicUserOp);
        const walletActionRes = await parsedUserOpToWalletAction(userOp, tokenService);
        expect(walletActionRes).toEqual(walletActionsExamples.NATIVE_TOKEN_TRANSFER_WALLET_ACTION);
    });

    test("ERC20 token transfer", async () => {
        basicUserOp.callData = ERC20_CALLDATA;
        const userOp = await userOpFactory.createUserOp(basicUserOp);
        const walletActionRes = await parsedUserOpToWalletAction(userOp, tokenService);
        expect(walletActionRes).toEqual(walletActionsExamples.ERC_20_TRANSFER_WALLET_ACTION);
    });

    test("approve token transfer", async () => {
        basicUserOp.callData = APPROVE_TOKEN_CALLDATA;
        const userOp = await userOpFactory.createUserOp(basicUserOp);
        const walletActionRes = await parsedUserOpToWalletAction(userOp, tokenService);
        expect(walletActionRes).toEqual(walletActionsExamples.APPROVE_TOKEN_WALLET_ACTION);
    });

    test("stake native token transfer", async () => {
        basicUserOp.callData = STAKE_NATIVE_TOKENS_CALLDATA;
        const userOp = await userOpFactory.createUserOp(basicUserOp);
        const walletActionRes = await parsedUserOpToWalletAction(userOp, tokenService);
        expect(walletActionRes).toEqual(walletActionsExamples.STAKE_NATIVE_TOKEN_WALLET_ACTION);
    });

    test("unstake native token transfer", async () => {
        basicUserOp.callData = UNSTAKE_NATIVE_TOKENS_CALLDATA;
        const userOp = await userOpFactory.createUserOp(basicUserOp);
        const walletActionRes = await parsedUserOpToWalletAction(userOp, tokenService);
        expect(walletActionRes).toEqual(walletActionsExamples.UNSTAKE_NATIVE_TOKENS_WALLET_ACTION);
    });

    test("ERC20 token stake", async () => {
        basicUserOp.callData = ERC_20_STAKE_CALLDATA;
        const userOp = await userOpFactory.createUserOp(basicUserOp);
        const walletActionRes = await parsedUserOpToWalletAction(userOp, tokenService);
        expect(walletActionRes).toEqual(walletActionsExamples.ERC_20_TOKEN_STAKE_WALLET_ACTION);
    });

    test("ERC20 token unstake transfer", async () => {
        basicUserOp.callData = ERC_20_UNSTAKE_CALLDATA;
        const userOp = await userOpFactory.createUserOp(basicUserOp);
        const walletActionRes = await parsedUserOpToWalletAction(userOp, tokenService);
        expect(walletActionRes).toEqual(walletActionsExamples.ERC_20_TOKEN_UNSTAKE_WALLET_ACTION);
    });

    test("swap eth for EXACT tokens transfer", async () => {
        basicUserOp.callData = SWAP_ETH_FOR_EXACT_TOKENS_CALLDATA;
        const userOp = await userOpFactory.createUserOp(basicUserOp);
        const walletActionRes = await parsedUserOpToWalletAction(userOp, tokenService);
        expect(walletActionRes).toEqual(walletActionsExamples.SWAP_ETH_FOR_EXACT_TOKENS_WALLET_ACTION);
    });

    test("swap EXACT eth for tokens transfer", async () => {
        basicUserOp.callData = SWAP_EXACT_ETH_FOR_TOKENS_CALLDATA;
        const userOp = await userOpFactory.createUserOp(basicUserOp);
        const walletActionRes = await parsedUserOpToWalletAction(userOp, tokenService);
        expect(walletActionRes).toEqual(walletActionsExamples.SWAP_EXACT_ETH_FOR_TOKENS_WALLET_ACTION);
    });

    test("swap EXACT tokens for eth transfer", async () => {
        basicUserOp.callData = SWAP_EXACT_TOKENS_FOR_ETH_CALLDATA;
        const userOp = await userOpFactory.createUserOp(basicUserOp);
        const walletActionRes = await parsedUserOpToWalletAction(userOp, tokenService);
        expect(walletActionRes).toEqual(walletActionsExamples.SWAP_EXACT_TOKENS_FOR_ETH_WALLET_ACTION);
    });

    test("swap tokens for EXACT eth transfer", async () => {
        basicUserOp.callData = SWAP_TOKENS_FOR_EXACT_ETH_CALLDATA;
        const userOp = await userOpFactory.createUserOp(basicUserOp);
        const walletActionRes = await parsedUserOpToWalletAction(userOp, tokenService);
        expect(walletActionRes).toEqual(walletActionsExamples.SWAP_TOKENS_FOR_EXACT_ETH_WALLET_ACTION);
    });

    test("swap EXACT tokens to tokens transfer", async () => {
        basicUserOp.callData = SWAP_EXACT_TOKENS_TO_TOKENS_CALLDATA;
        const userOp = await userOpFactory.createUserOp(basicUserOp);
        const walletActionRes = await parsedUserOpToWalletAction(userOp, tokenService);
        expect(walletActionRes).toEqual(walletActionsExamples.SWAP_EXACT_TOKENS_TO_TOKENS_WALLET_ACTION);
    });

    test("swap tokens to EXACT tokens", async () => {
        //CURRENTLY NOT SUPPORTED
    });

    test("NFT token transfer", async () => {
        basicUserOp.callData = TRANSFER_NFT_CALLDATA;
        const userOp = await userOpFactory.createUserOp(basicUserOp);
        const walletActionRes = await parsedUserOpToWalletAction(userOp, tokenService);
        expect(walletActionRes).toEqual(walletActionsExamples.NFT_TOKEN_TRANSFER_WALLET_ACTION);
    });
});