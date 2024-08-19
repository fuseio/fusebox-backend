import { UserOpParser } from '@app/smart-wallets-service/common/services/user-op-parser.service'
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
  // BATCH_TRANSACTION_CALLDATA_ONLY_ERC20_TOKENS,
  // BATCH_TRANSACTION_CALLDATA,
  TRANSFER_NFT_CALLDATA,
  SWAP_ROUTER_ERC20_TO_ERC20_CALLDATA,
  SWAP_ROUTER_NATIVE_TO_ERC20_CALLDATA
} from './constants/calldataExamples'

describe('UserOpParser Tests', () => {
  let parser: UserOpParser

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserOpParser]
    }).compile()
    parser = module.get<UserOpParser>(UserOpParser)
  })

  it('userOp native token transfer calldata', async () => {
    const res = await parser.parseCallData(NATIVE_TRANSFER_CALLDATA)
    expect(res.targetFunctions[0].targetAddress).toBe('0x5BBEA139C1b1b32CF7b5C7fD1D1fF802De006117')
    expect(res.name).toBe('execute')
    expect(res.targetFunctions[0].name).toBe('nativeTransfer')
  })

  it('userOp erc-20 transfer calldata', async () => {
    const res = await parser.parseCallData(ERC20_CALLDATA)
    expect(res.targetFunctions[0].targetAddress).toBe('0xb1232fD89d027e4B949cED570609e8aD0e18811e')
    expect(res.name).toBe('execute')
    expect(res.targetFunctions[0].name).toBe('transfer')
    expect(res.targetFunctions[0].callData[0]).toBe('0xcc95E80DA76bd41507b99d9b977Dc3062bcf6430')
  })

  it('userOp erc-20 approve calldata', async () => {
    const res = await parser.parseCallData(APPROVE_TOKEN_CALLDATA)
    expect(res.targetFunctions[0].targetAddress).toBe('0x495d133B938596C9984d462F007B676bDc57eCEC')
    expect(res.name).toBe('execute')
    expect(res.targetFunctions[0].callData[0]).toBe('0x5BBEA139C1b1b32CF7b5C7fD1D1fF802De006117')
    expect(res.targetFunctions[0].name).toBe('approve')
  })

  it('userOp native token stake calldata', async () => {
    const res = await parser.parseCallData(STAKE_NATIVE_TOKENS_CALLDATA)
    expect(res.name).toBe('execute')
    expect(res.targetFunctions[0].targetAddress).toBe('0xa3dc222eC847Aac61FB6910496295bF344Ea46be')
    expect(res.targetFunctions[0].name).toBe('deposit')
  })

  it('userOp native token UNstake calldata', async () => {
    const res = await parser.parseCallData(UNSTAKE_NATIVE_TOKENS_CALLDATA)
    expect(res.name).toBe('executeBatch')
    expect(res.targetFunctions[0].targetAddress).toBe('0xb1DD0B683d9A56525cC096fbF5eec6E60FE79871')
    expect(res.targetFunctions[0].name).toBe('approve')
    expect(res.targetFunctions[0].callData[0]).toBe('0xa3dc222eC847Aac61FB6910496295bF344Ea46be')
    expect(res.targetFunctions[1].targetAddress).toBe('0xa3dc222eC847Aac61FB6910496295bF344Ea46be')
    expect(res.targetFunctions[1].name).toBe('withdraw')
  })

  it('userOp ERC-20 token stake calldata', async () => {
    const res = await parser.parseCallData(ERC_20_STAKE_CALLDATA)
    expect(res.name).toBe('executeBatch')
    expect(res.targetFunctions[0].targetAddress).toBe('0x34Ef2Cc892a88415e9f02b91BfA9c91fC0bE6bD4')
    expect(res.targetFunctions[0].name).toBe('approve')
    expect(res.targetFunctions[1].targetAddress).toBe('0x97a6e78c9208c21afaDa67e7E61d7ad27688eFd1')
    expect(res.targetFunctions[1].name).toBe('enter')
  })

  it('userOp ERC-20 token UNstake calldata', async () => {
    const res = await parser.parseCallData(ERC_20_UNSTAKE_CALLDATA)
    expect(res.name).toBe('executeBatch')
    expect(res.targetFunctions[0].targetAddress).toBe('0xb1DD0B683d9A56525cC096fbF5eec6E60FE79871')
    expect(res.targetFunctions[0].name).toBe('approve')
    expect(res.targetFunctions[1].targetAddress).toBe('0x97a6e78c9208c21afaDa67e7E61d7ad27688eFd1')
    expect(res.targetFunctions[1].name).toBe('leave')
  })

  it('userOp NFT token transfer calldata', async () => {
    const res = await parser.parseCallData(TRANSFER_NFT_CALLDATA)
    expect(res.name).toBe('execute')
    expect(res.targetFunctions[0].targetAddress).toBe('0x32319834d90323127988E4e2DC7b2162d4262904')
    expect(res.targetFunctions[0].name).toBe('transferFrom')
    expect(res.targetFunctions[0].callData[0]).toBe('0x5BBEA139C1b1b32CF7b5C7fD1D1fF802De006117')
    expect(res.targetFunctions[0].callData[1]).toBe('0x5BBEA139C1b1b32CF7b5C7fD1D1fF802De006117')
  })

  it('swapExactETHForTokens function calldata', async () => {
    const res = await parser.parseCallData(SWAP_EXACT_ETH_FOR_TOKENS_CALLDATA)
    expect(res.name).toBe('execute')
    expect(res.targetFunctions[0].targetAddress).toBe('0xE3F85aAd0c8DD7337427B9dF5d0fB741d65EEEB5')
    expect(res.targetFunctions[0].name).toBe('swapExactETHForTokens')
    expect(res.targetFunctions[0].callData[1][0]).toBe('0x0BE9e53fd7EDaC9F859882AfdDa116645287C629')
    expect(res.targetFunctions[0].callData[1][1]).toBe('0x495d133B938596C9984d462F007B676bDc57eCEC')
    expect(res.targetFunctions[0].callData[2]).toBe('0x5BBEA139C1b1b32CF7b5C7fD1D1fF802De006117')
  })

  it('swapETHForExactTokens function calldata', async () => {
    const res = await parser.parseCallData(SWAP_ETH_FOR_EXACT_TOKENS_CALLDATA)
    expect(res.name).toBe('execute')
    expect(res.targetFunctions[0].targetAddress).toBe('0xE3F85aAd0c8DD7337427B9dF5d0fB741d65EEEB5')
    expect(res.targetFunctions[0].name).toBe('swapETHForExactTokens')
    expect(res.targetFunctions[0].callData[1][0]).toBe('0x0BE9e53fd7EDaC9F859882AfdDa116645287C629')
    expect(res.targetFunctions[0].callData[1][1]).toBe('0x6a5F6A8121592BeCd6747a38d67451B310F7f156')
    expect(res.targetFunctions[0].callData[2]).toBe('0xdf5bA6044f17Ec46B1F00c580916843E25996db9')
  })

  it('swapTokensForExactEth function calldata', async () => {
    const res = await parser.parseCallData(SWAP_TOKENS_FOR_EXACT_ETH_CALLDATA)
    expect(res.name).toBe('executeBatch')
    expect(res.targetFunctions[0].targetAddress).toBe('0x34Ef2Cc892a88415e9f02b91BfA9c91fC0bE6bD4')
    expect(res.targetFunctions[1].targetAddress).toBe('0xE3F85aAd0c8DD7337427B9dF5d0fB741d65EEEB5')
    expect(res.targetFunctions[0].targetAddress).toBe('0x34Ef2Cc892a88415e9f02b91BfA9c91fC0bE6bD4')
    expect(res.targetFunctions[1].name).toBe('swapTokensForExactETH')
    expect(res.targetFunctions[1].callData[2][0]).toBe('0x6a5F6A8121592BeCd6747a38d67451B310F7f156') // BUSD
    expect(res.targetFunctions[1].callData[2][1]).toBe('0x0BE9e53fd7EDaC9F859882AfdDa116645287C629') // Goodollar
    expect(res.targetFunctions[1].callData[3]).toBe('0xdf5bA6044f17Ec46B1F00c580916843E25996db9')
  })

  it('swapExactTokensForEth function calldata', async () => {
    const res = await parser.parseCallData(SWAP_EXACT_TOKENS_FOR_ETH_CALLDATA)
    expect(res.name).toBe('executeBatch')
    expect(res.targetFunctions[0].targetAddress).toBe('0x34Ef2Cc892a88415e9f02b91BfA9c91fC0bE6bD4')
    expect(res.targetFunctions[1].targetAddress).toBe('0xE3F85aAd0c8DD7337427B9dF5d0fB741d65EEEB5')
    expect(res.targetFunctions[0].targetAddress).toBe('0x34Ef2Cc892a88415e9f02b91BfA9c91fC0bE6bD4')
    expect(res.targetFunctions[1].name).toBe('swapExactTokensForETH')
    expect(res.targetFunctions[1].callData[2][0]).toBe('0x34Ef2Cc892a88415e9f02b91BfA9c91fC0bE6bD4') // Volt
    expect(res.targetFunctions[1].callData[2][1]).toBe('0x0BE9e53fd7EDaC9F859882AfdDa116645287C629') // Goodollar
    expect(res.targetFunctions[1].callData[3]).toBe('0xE65513Fe95F52F4350D2184c2fD722c37e6Fd995')
  })

  it('swapExactTokensForTokens function calldata', async () => {
    const res = await parser.parseCallData(SWAP_EXACT_TOKENS_TO_TOKENS_CALLDATA)
    expect(res.name).toBe('executeBatch')
    expect(res.targetFunctions[0].targetAddress).toBe('0x495d133B938596C9984d462F007B676bDc57eCEC')
    expect(res.targetFunctions[1].targetAddress).toBe('0xE3F85aAd0c8DD7337427B9dF5d0fB741d65EEEB5')
    expect(res.targetFunctions[0].name).toBe('approve')
    expect(res.targetFunctions[0].targetAddress).toBe('0x495d133B938596C9984d462F007B676bDc57eCEC') // Goodollar Approve
    expect(res.targetFunctions[1].name).toBe('swapExactTokensForTokens')
    expect(res.targetFunctions[1].callData[2][0]).toBe('0x495d133B938596C9984d462F007B676bDc57eCEC') // Goodollar
    expect(res.targetFunctions[1].callData[2][1]).toBe('0x0BE9e53fd7EDaC9F859882AfdDa116645287C629') // WFUSE
    expect(res.targetFunctions[1].callData[2][2]).toBe('0x588e24DEd8f850b14BB2e62E9c50A7Cd5Ee13Da9') // TerraLuna
    expect(res.targetFunctions[1].callData[3]).toBe('0x5BBEA139C1b1b32CF7b5C7fD1D1fF802De006117')
  })

  it('swapRouterErc20toErc20', async () => {
    const res = await parser.parseCallData(SWAP_ROUTER_ERC20_TO_ERC20_CALLDATA)

    expect(res.name).toBe('executeBatch')
    expect(res.targetFunctions).toHaveLength(2)

    // First target function (approve)
    expect(res.targetFunctions[0].targetAddress).toBe('0x34Ef2Cc892a88415e9f02b91BfA9c91fC0bE6bD4')
    expect(res.targetFunctions[0].name).toBe('approve')
    expect(res.targetFunctions[0].callData[0]).toBe('0xEcA6055ac01E717cEF70b8C6fC5F9ca32Cb4118a')
    expect(res.targetFunctions[0].callData[1].toString()).toBe('1000000000000000000')

    // Second target function (transformERC20)
    expect(res.targetFunctions[1].targetAddress).toBe('0xEcA6055ac01E717cEF70b8C6fC5F9ca32Cb4118a')
    expect(res.targetFunctions[1].name).toBe('transformERC20')
    expect(res.targetFunctions[1].callData[0]).toBe('0x34Ef2Cc892a88415e9f02b91BfA9c91fC0bE6bD4')
    expect(res.targetFunctions[1].callData[1]).toBe('0x620fd5fa44BE6af63715Ef4E65DDFA0387aD13F5')
    expect(res.targetFunctions[1].callData[2].toString()).toBe('1000000000000000000')
    expect(res.targetFunctions[1].callData[3].toString()).toBe('87')
    expect(Array.isArray(res.targetFunctions[1].callData[4])).toBe(true)
  })

  it('swapRouterNativetoErc20', async () => {
    const res = await parser.parseCallData(SWAP_ROUTER_NATIVE_TO_ERC20_CALLDATA)

    expect(res.name).toBe('execute')
    expect(res.targetFunctions).toHaveLength(1)

    // Check the target function (transformERC20)
    const targetFunction = res.targetFunctions[0]
    expect(targetFunction.targetAddress).toBe('0xEcA6055ac01E717cEF70b8C6fC5F9ca32Cb4118a')
    expect(targetFunction.name).toBe('transformERC20')
    expect(targetFunction.value).toBe('10000000000000000')
    expect(targetFunction.callData).toHaveLength(5)
    expect(targetFunction.callData[0]).toBe('0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE')
    expect(targetFunction.callData[1]).toBe('0x620fd5fa44BE6af63715Ef4E65DDFA0387aD13F5')
    expect(targetFunction.callData[2].toString()).toBe('10000000000000000')
    expect(targetFunction.callData[3].toString()).toBe('333')
    expect(Array.isArray(targetFunction.callData[4])).toBe(true)
  })
})
