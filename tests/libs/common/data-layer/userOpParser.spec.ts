import { Test, TestingModule } from '@nestjs/testing'

import {
  NATIVE_TRANSFER_CALLDATA,
  ERC20_CALLDATA,
  APPROVE_TOKEN_CALLDATA,
  STAKE_NATIVE_TOKENS_CALLDATA,
  UNSTAKE_NATIVE_TOKENS_CALLDATA,
  ERC_20_STAKE_CALLDATA,
  ERC_20_UNSTAKE_CALLDATA,
  // BATCH_TRANSACTION_CALLDATA_ONLY_ERC20_TOKENS,
  // BATCH_TRANSACTION_CALLDATA,
  TRANSFER_NFT_CALLDATA,
  SWAP_ROUTER_ERC20_TO_ERC20_CALLDATA,
  SWAP_ROUTER_NATIVE_TO_ERC20_CALLDATA,
  NATIVE_TRANSFER_CALLDATA_07,
  ERC20_CALLDATA_07,
  TRANSFER_NFT_CALLDATA_07,
  BATCH_TRANSACTION_CALLDATA_07
} from './constants/calldataExamples'
import { UserOpParser } from '@app/common/services/user-op-parser.service'

describe('UserOpParser Entrypoint v0.6 Tests', () => {
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

  it('swapRouterErc20ToErc20', async () => {
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

  it('swapRouterNativeToErc20', async () => {
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

describe('UserOpParser Entrypoint v0.7 Tests', () => {
  let parser: UserOpParser

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserOpParser]
    }).compile()
    parser = module.get<UserOpParser>(UserOpParser)
  })

  it('userOp native token transfer calldata', async () => {
    const res = await parser.parseCallData(NATIVE_TRANSFER_CALLDATA_07)
    expect(res.targetFunctions[0].targetAddress).toBe('0x0x7ceabc27b1dc6a065fad85a86afbaf97f7692088')
    expect(res.name).toBe('execute')
    expect(res.targetFunctions[0].name).toBe('nativeTransfer')
  })

  it('userOp erc-20 transfer calldata', async () => {
    const res = await parser.parseCallData(ERC20_CALLDATA_07)
    expect(res.targetFunctions[0].targetAddress).toBe('0xa28a4897C3Ad7223764dcAe37e78B1070c38B562')
    expect(res.name).toBe('executeUserOpWithErrorString')
    expect(res.targetFunctions[0].name).toBe('transfer')
    expect(res.targetFunctions[0].callData[0]).toBe('0x7Ceabc27B1dc6A065fAD85A86AFBaF97F7692088')
  })

  // it('userOp erc-20 approve calldata', async () => {
  //   const res = await parser.parseCallData(APPROVE_TOKEN_CALLDATA)
  //   expect(res.targetFunctions[0].targetAddress).toBe('0x495d133B938596C9984d462F007B676bDc57eCEC')
  //   expect(res.name).toBe('execute')
  //   expect(res.targetFunctions[0].callData[0]).toBe('0x5BBEA139C1b1b32CF7b5C7fD1D1fF802De006117')
  //   expect(res.targetFunctions[0].name).toBe('approve')
  // })

  // it('userOp native token stake calldata', async () => {
  //   const res = await parser.parseCallData(STAKE_NATIVE_TOKENS_CALLDATA)
  //   expect(res.name).toBe('execute')
  //   expect(res.targetFunctions[0].targetAddress).toBe('0xa3dc222eC847Aac61FB6910496295bF344Ea46be')
  //   expect(res.targetFunctions[0].name).toBe('deposit')
  // })

  // it('userOp native token UNstake calldata', async () => {
  //   const res = await parser.parseCallData(UNSTAKE_NATIVE_TOKENS_CALLDATA)
  //   expect(res.name).toBe('executeBatch')
  //   expect(res.targetFunctions[0].targetAddress).toBe('0xb1DD0B683d9A56525cC096fbF5eec6E60FE79871')
  //   expect(res.targetFunctions[0].name).toBe('approve')
  //   expect(res.targetFunctions[0].callData[0]).toBe('0xa3dc222eC847Aac61FB6910496295bF344Ea46be')
  //   expect(res.targetFunctions[1].targetAddress).toBe('0xa3dc222eC847Aac61FB6910496295bF344Ea46be')
  //   expect(res.targetFunctions[1].name).toBe('withdraw')
  // })

  // it('userOp ERC-20 token stake calldata', async () => {
  //   const res = await parser.parseCallData(ERC_20_STAKE_CALLDATA)
  //   expect(res.name).toBe('executeBatch')
  //   expect(res.targetFunctions[0].targetAddress).toBe('0x34Ef2Cc892a88415e9f02b91BfA9c91fC0bE6bD4')
  //   expect(res.targetFunctions[0].name).toBe('approve')
  //   expect(res.targetFunctions[1].targetAddress).toBe('0x97a6e78c9208c21afaDa67e7E61d7ad27688eFd1')
  //   expect(res.targetFunctions[1].name).toBe('enter')
  // })

  // it('userOp ERC-20 token UNstake calldata', async () => {
  //   const res = await parser.parseCallData(ERC_20_UNSTAKE_CALLDATA)
  //   expect(res.name).toBe('executeBatch')
  //   expect(res.targetFunctions[0].targetAddress).toBe('0xb1DD0B683d9A56525cC096fbF5eec6E60FE79871')
  //   expect(res.targetFunctions[0].name).toBe('approve')
  //   expect(res.targetFunctions[1].targetAddress).toBe('0x97a6e78c9208c21afaDa67e7E61d7ad27688eFd1')
  //   expect(res.targetFunctions[1].name).toBe('leave')
  // })

  it('userOp NFT token transfer calldata', async () => {
    const res = await parser.parseCallData(TRANSFER_NFT_CALLDATA_07)
    expect(res.name).toBe('executeUserOpWithErrorString')
    expect(res.targetFunctions[0].targetAddress).toBe('0x6B51B198ddffc5f4e9231420351d677Cef99B6E4')
    expect(res.targetFunctions[0].name).toBe('safeTransferFrom')
    expect(res.targetFunctions[0].callData[0]).toBe('0x7CafDB72804eEf9edB93a980fe89959801Cf6684')
    expect(res.targetFunctions[0].callData[1]).toBe('0x7Ceabc27B1dc6A065fAD85A86AFBaF97F7692088')
  })

  it('userOp batch transaction calldata', async () => {
    const res = await parser.parseCallData(BATCH_TRANSACTION_CALLDATA_07)
    expect(res.name).toBe('execute')
    expect(res.targetFunctions).toHaveLength(2)
  })

  // it('swapRouterErc20ToErc20', async () => {
  //   const res = await parser.parseCallData(SWAP_ROUTER_ERC20_TO_ERC20_CALLDATA)

  //   expect(res.name).toBe('executeBatch')
  //   expect(res.targetFunctions).toHaveLength(2)

  //   // First target function (approve)
  //   expect(res.targetFunctions[0].targetAddress).toBe('0x34Ef2Cc892a88415e9f02b91BfA9c91fC0bE6bD4')
  //   expect(res.targetFunctions[0].name).toBe('approve')
  //   expect(res.targetFunctions[0].callData[0]).toBe('0xEcA6055ac01E717cEF70b8C6fC5F9ca32Cb4118a')
  //   expect(res.targetFunctions[0].callData[1].toString()).toBe('1000000000000000000')

  //   // Second target function (transformERC20)
  //   expect(res.targetFunctions[1].targetAddress).toBe('0xEcA6055ac01E717cEF70b8C6fC5F9ca32Cb4118a')
  //   expect(res.targetFunctions[1].name).toBe('transformERC20')
  //   expect(res.targetFunctions[1].callData[0]).toBe('0x34Ef2Cc892a88415e9f02b91BfA9c91fC0bE6bD4')
  //   expect(res.targetFunctions[1].callData[1]).toBe('0x620fd5fa44BE6af63715Ef4E65DDFA0387aD13F5')
  //   expect(res.targetFunctions[1].callData[2].toString()).toBe('1000000000000000000')
  //   expect(res.targetFunctions[1].callData[3].toString()).toBe('87')
  //   expect(Array.isArray(res.targetFunctions[1].callData[4])).toBe(true)
  // })

  // it('swapRouterNativeToErc20', async () => {
  //   const res = await parser.parseCallData(SWAP_ROUTER_NATIVE_TO_ERC20_CALLDATA)

  //   expect(res.name).toBe('execute')
  //   expect(res.targetFunctions).toHaveLength(1)

  //   // Check the target function (transformERC20)
  //   const targetFunction = res.targetFunctions[0]
  //   expect(targetFunction.targetAddress).toBe('0xEcA6055ac01E717cEF70b8C6fC5F9ca32Cb4118a')
  //   expect(targetFunction.name).toBe('transformERC20')
  //   expect(targetFunction.value).toBe('10000000000000000')
  //   expect(targetFunction.callData).toHaveLength(5)
  //   expect(targetFunction.callData[0]).toBe('0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE')
  //   expect(targetFunction.callData[1]).toBe('0x620fd5fa44BE6af63715Ef4E65DDFA0387aD13F5')
  //   expect(targetFunction.callData[2].toString()).toBe('10000000000000000')
  //   expect(targetFunction.callData[3].toString()).toBe('333')
  //   expect(Array.isArray(targetFunction.callData[4])).toBe(true)
  // })
})
