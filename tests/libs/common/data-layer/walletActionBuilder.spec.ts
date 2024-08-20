import { expect } from '@jest/globals'
import { UserOpFactory } from '@app/smart-wallets-service/common/services/user-op-factory.service'
import { parsedUserOpToWalletAction } from '@app/smart-wallets-service/common/utils/wallet-action-factory'
import { TokenService } from '@app/smart-wallets-service/common/services/token.service'
import { ConfigService } from '@nestjs/config'
import * as walletActionsExamples from './constants/walletActionsExamples'
import { Test, TestingModule } from '@nestjs/testing'
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
  TRANSFER_NFT_CALLDATA,
  SWAP_ROUTER_ERC20_TO_ERC20_CALLDATA,
  SWAP_ROUTER_NATIVE_TO_ERC20_CALLDATA
} from './constants/calldataExamples'
import { UserOpParser } from '@app/common/services/user-op-parser.service'

const basicUserOp = {
  sender: '0x5bbea139c1b1b32cf7b5c7fd1d1ff802de006117',
  nonce: '0x57',
  initCode: '0x',
  callData: '0x',
  callGasLimit: '0x5cc3',
  verificationGasLimit: '0x148f0',
  preVerificationGas: '0xae28',
  maxFeePerGas: '0x2e4e2bf80',
  maxPriorityFeePerGas: '0x2e4e2bf80',
  paymasterAndData: '0x',
  signature: '0x0214a6ac4c09b14982243ee8de9f7ac66951d92cea9afc3b6b3134cf9c02744f4715706c3ddac8ffe4978a34c0ca50cb461ca9629c7dfe4a29cbb3de0aef2d831b',
  userOpHash: '0x111',
  paymaster: '0x',
  success: false,
  actualGasCost: 0,
  actualGasUsed: 0
}

const mockTokenService = {
  getTokenInfo: jest.fn().mockImplementation((address) => {
    const tokens = {
      '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE': {
        name: 'Fuse Token',
        symbol: 'FUSE',
        decimals: 18,
        address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        type: 'native'
      },
      '0x32319834d90323127988E4e2DC7b2162d4262904': {
        name: 'Cozy Cosmonauts',
        symbol: 'COZY',
        decimals: 0,
        address: '0x32319834d90323127988E4e2DC7b2162d4262904',
        type: 'ERC-721'
      },
      '0x495d133B938596C9984d462F007B676bDc57eCEC': {
        name: 'GoodDollar',
        symbol: 'G$',
        decimals: 2,
        address: '0x495d133B938596C9984d462F007B676bDc57eCEC',
        type: 'ERC-20'
      },
      '0x588e24DEd8f850b14BB2e62E9c50A7Cd5Ee13Da9': {
        name: 'Luna Terra',
        symbol: 'atLUNA',
        decimals: 18,
        address: '0x588e24DEd8f850b14BB2e62E9c50A7Cd5Ee13Da9',
        type: 'ERC-20'
      },
      '0x6a5F6A8121592BeCd6747a38d67451B310F7f156': {
        name: 'Binance USD on Fuse',
        symbol: 'BUSD',
        decimals: 18,
        address: '0x6a5F6A8121592BeCd6747a38d67451B310F7f156',
        type: 'ERC-20'
      },
      '0xb1DD0B683d9A56525cC096fbF5eec6E60FE79871': {
        name: 'Liquid staked Fuse',
        symbol: 'sFUSE',
        decimals: 18,
        address: '0xb1DD0B683d9A56525cC096fbF5eec6E60FE79871',
        type: 'ERC-20'
      },
      '0xb1232fD89d027e4B949cED570609e8aD0e18811e': {
        name: 'Flambucks',
        symbol: 'Fmb',
        decimals: 18,
        address: '0xb1232fD89d027e4B949cED570609e8aD0e18811e',
        type: 'ERC-20'
      },
      // Add the missing tokens here
      '0x34Ef2Cc892a88415e9f02b91BfA9c91fC0bE6bD4': {
        name: 'VoltToken',
        symbol: 'VOLT',
        decimals: 18,
        address: '0x34Ef2Cc892a88415e9f02b91BfA9c91fC0bE6bD4',
        type: 'ERC-20'
      },
      '0x97a6e78c9208c21afaDa67e7E61d7ad27688eFd1': {
        name: 'VoltBar',
        symbol: 'xVOLT',
        decimals: 18,
        address: '0x97a6e78c9208c21afaDa67e7E61d7ad27688eFd1',
        type: 'ERC-20'
      },
      '0x0BE9e53fd7EDaC9F859882AfdDa116645287C629': {
        name: 'Wrapped Fuse',
        symbol: 'WFUSE',
        decimals: 18,
        address: '0x0BE9e53fd7EDaC9F859882AfdDa116645287C629',
        type: 'ERC-20'
      },
      '0x620fd5fa44BE6af63715Ef4E65DDFA0387aD13F5': {
        name: 'USD Coin on Fuse',
        symbol: 'USDC',
        decimals: 6,
        address: '0x620fd5fa44BE6af63715Ef4E65DDFA0387aD13F5',
        type: 'ERC-20'
      }

    }
    return Promise.resolve(tokens[address] || {
      name: 'Unknown Token',
      symbol: 'UNK',
      decimals: 18,
      address,
      type: 'ERC-20'
    })
  }),
  fetchTokenDetails: jest.fn().mockImplementation(function (address) {
    return this.getTokenInfo(address)
  })
}

const mockEthersProvider = {
  // Add mock methods here if needed
}

describe('DataLayerService Tests', () => {
  let userOpFactory: UserOpFactory
  let tokenService: TokenService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserOpFactory,
        UserOpParser,
        {
          provide: TokenService,
          useValue: mockTokenService
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue({
              rpc: {
                url: 'https://rpc.fuse.io'
              }
            })
          }
        },
        {
          provide: 'EthersJS:Provider:regular-node',
          useValue: mockEthersProvider
        }
      ]
    }).compile()

    userOpFactory = module.get<UserOpFactory>(UserOpFactory)
    tokenService = module.get<TokenService>(TokenService)
  })

  test('native token transfer', async () => {
    basicUserOp.callData = NATIVE_TRANSFER_CALLDATA
    const userOp = await userOpFactory.createUserOp(basicUserOp)
    const walletActionRes = await parsedUserOpToWalletAction(userOp, tokenService)
    expect(walletActionRes).toEqual(walletActionsExamples.NATIVE_TOKEN_TRANSFER_WALLET_ACTION)
  })

  test('ERC20 token transfer', async () => {
    basicUserOp.callData = ERC20_CALLDATA
    const userOp = await userOpFactory.createUserOp(basicUserOp)
    const walletActionRes = await parsedUserOpToWalletAction(userOp, tokenService)
    expect(walletActionRes).toEqual(walletActionsExamples.ERC_20_TRANSFER_WALLET_ACTION)
  })

  test('approve token transfer', async () => {
    basicUserOp.callData = APPROVE_TOKEN_CALLDATA
    const userOp = await userOpFactory.createUserOp(basicUserOp)
    const walletActionRes = await parsedUserOpToWalletAction(userOp, tokenService)
    expect(walletActionRes).toEqual(walletActionsExamples.APPROVE_TOKEN_WALLET_ACTION)
  })

  test('stake native token transfer', async () => {
    basicUserOp.callData = STAKE_NATIVE_TOKENS_CALLDATA
    const userOp = await userOpFactory.createUserOp(basicUserOp)
    const walletActionRes = await parsedUserOpToWalletAction(userOp, tokenService)
    expect(walletActionRes).toEqual(walletActionsExamples.STAKE_NATIVE_TOKEN_WALLET_ACTION)
  })

  test('unstake native token transfer', async () => {
    basicUserOp.callData = UNSTAKE_NATIVE_TOKENS_CALLDATA
    const userOp = await userOpFactory.createUserOp(basicUserOp)
    const walletActionRes = await parsedUserOpToWalletAction(userOp, tokenService)
    expect(walletActionRes).toEqual(walletActionsExamples.UNSTAKE_NATIVE_TOKENS_WALLET_ACTION)
  })

  test('ERC20 token stake', async () => {
    basicUserOp.callData = ERC_20_STAKE_CALLDATA
    const userOp = await userOpFactory.createUserOp(basicUserOp)
    const walletActionRes = await parsedUserOpToWalletAction(userOp, tokenService)
    expect(walletActionRes).toEqual(walletActionsExamples.ERC_20_TOKEN_STAKE_WALLET_ACTION)
  })

  test('ERC20 token unstake transfer', async () => {
    basicUserOp.callData = ERC_20_UNSTAKE_CALLDATA
    const userOp = await userOpFactory.createUserOp(basicUserOp)
    const walletActionRes = await parsedUserOpToWalletAction(userOp, tokenService)
    expect(walletActionRes).toEqual(walletActionsExamples.ERC_20_TOKEN_UNSTAKE_WALLET_ACTION)
  })

  test('swap eth for EXACT tokens transfer', async () => {
    basicUserOp.callData = SWAP_ETH_FOR_EXACT_TOKENS_CALLDATA
    const userOp = await userOpFactory.createUserOp(basicUserOp)
    const walletActionRes = await parsedUserOpToWalletAction(userOp, tokenService)
    expect(walletActionRes).toEqual(walletActionsExamples.SWAP_ETH_FOR_EXACT_TOKENS_WALLET_ACTION)
  })

  test('swap EXACT eth for tokens transfer', async () => {
    basicUserOp.callData = SWAP_EXACT_ETH_FOR_TOKENS_CALLDATA
    const userOp = await userOpFactory.createUserOp(basicUserOp)
    const walletActionRes = await parsedUserOpToWalletAction(userOp, tokenService)
    expect(walletActionRes).toEqual(walletActionsExamples.SWAP_EXACT_ETH_FOR_TOKENS_WALLET_ACTION)
  })

  test('swap EXACT tokens for eth transfer', async () => {
    basicUserOp.callData = SWAP_EXACT_TOKENS_FOR_ETH_CALLDATA
    const userOp = await userOpFactory.createUserOp(basicUserOp)
    const walletActionRes = await parsedUserOpToWalletAction(userOp, tokenService)
    expect(walletActionRes).toEqual(walletActionsExamples.SWAP_EXACT_TOKENS_FOR_ETH_WALLET_ACTION)
  })

  test('swap tokens for EXACT eth transfer', async () => {
    basicUserOp.callData = SWAP_TOKENS_FOR_EXACT_ETH_CALLDATA
    const userOp = await userOpFactory.createUserOp(basicUserOp)
    const walletActionRes = await parsedUserOpToWalletAction(userOp, tokenService)
    expect(walletActionRes).toEqual(walletActionsExamples.SWAP_TOKENS_FOR_EXACT_ETH_WALLET_ACTION)
  })

  test('swap EXACT tokens to tokens transfer', async () => {
    basicUserOp.callData = SWAP_EXACT_TOKENS_TO_TOKENS_CALLDATA
    const userOp = await userOpFactory.createUserOp(basicUserOp)
    const walletActionRes = await parsedUserOpToWalletAction(userOp, tokenService)
    expect(walletActionRes).toEqual(walletActionsExamples.SWAP_EXACT_TOKENS_TO_TOKENS_WALLET_ACTION)
  })

  test('swap tokens to EXACT tokens', async () => {
    // CURRENTLY NOT SUPPORTED
  })

  test('NFT token transfer', async () => {
    basicUserOp.callData = TRANSFER_NFT_CALLDATA
    const userOp = await userOpFactory.createUserOp(basicUserOp)
    const walletActionRes = await parsedUserOpToWalletAction(userOp, tokenService)
    expect(walletActionRes).toEqual(walletActionsExamples.NFT_TOKEN_TRANSFER_WALLET_ACTION)
  })
  test('Router Swap ERC20 to ERC20', async () => {
    basicUserOp.callData = SWAP_ROUTER_ERC20_TO_ERC20_CALLDATA
    const userOp = await userOpFactory.createUserOp(basicUserOp)
    const walletActionRes = await parsedUserOpToWalletAction(userOp, tokenService)
    expect(walletActionRes).toEqual(walletActionsExamples.SWAP_ROUTER_ERC20_TO_ERC20_WALLET_ACTION)
  })
  test('Router Swap NATIVE to ERC20', async () => {
    basicUserOp.callData = SWAP_ROUTER_NATIVE_TO_ERC20_CALLDATA
    const userOp = await userOpFactory.createUserOp(basicUserOp)
    const walletActionRes = await parsedUserOpToWalletAction(userOp, tokenService)
    expect(walletActionRes).toEqual(walletActionsExamples.SWAP_ROUTER_NATIVE_TO_ERC20_WALLET_ACTION)
  })
})
