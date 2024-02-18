
import { assert } from 'chai'
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
  // SWAP_TOKENS_TO_EXACT_TOKENS_CALLDATA,
  BATCH_TRANSACTION_CALLDATA_ONLY_ERC20_TOKENS,
  BATCH_TRANSACTION_CALLDATA,
  TRANSFER_NFT_CALLDATA
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
    assert.equal(res.targetFunctions[0].targetAddress, '0x5BBEA139C1b1b32CF7b5C7fD1D1fF802De006117')
    assert.equal(res.name, 'execute')
    assert.equal(res.targetFunctions[0].name, 'nativeTransfer')
  })

  it('userOp erc-20 transfer calldata', async () => {
    const res = await parser.parseCallData(ERC20_CALLDATA)
    assert.equal(res.targetFunctions[0].targetAddress, '0xb1232fD89d027e4B949cED570609e8aD0e18811e')
    assert.equal(res.name, 'execute')
    assert.equal(res.targetFunctions[0].name, 'transfer')
    assert.equal(res.targetFunctions[0].callData[0], '0xcc95E80DA76bd41507b99d9b977Dc3062bcf6430')
  })

  it('userOp erc-20 approve calldata', async () => {
    const res = await parser.parseCallData(APPROVE_TOKEN_CALLDATA)
    assert.equal(res.targetFunctions[0].targetAddress, '0x495d133B938596C9984d462F007B676bDc57eCEC')
    assert.equal(res.name, 'execute')
    assert.equal(res.targetFunctions[0].callData[0], '0x5BBEA139C1b1b32CF7b5C7fD1D1fF802De006117')
    assert.equal(res.targetFunctions[0].name, 'approve')
  })

  it('userOp native token stake calldata', async () => {
    const res = await parser.parseCallData(STAKE_NATIVE_TOKENS_CALLDATA)
    assert.equal(res.name, 'execute')
    assert.equal(res.targetFunctions[0].targetAddress, '0xa3dc222eC847Aac61FB6910496295bF344Ea46be')
    assert.equal(res.targetFunctions[0].name, 'deposit')
  })

  it('userOp native token UNstake calldata', async () => {
    const res = await parser.parseCallData(UNSTAKE_NATIVE_TOKENS_CALLDATA)
    assert.equal(res.name, 'executeBatch')
    assert.equal(res.targetFunctions[0].targetAddress, '0xb1DD0B683d9A56525cC096fbF5eec6E60FE79871')
    assert.equal(res.targetFunctions[0].name, 'approve')
    assert.equal(res.targetFunctions[0].callData[0], '0xa3dc222eC847Aac61FB6910496295bF344Ea46be')
    assert.equal(res.targetFunctions[1].targetAddress, '0xa3dc222eC847Aac61FB6910496295bF344Ea46be')
    assert.equal(res.targetFunctions[1].name, 'withdraw')
  })
  it('userOp ERC-20 token stake calldata', async () => {
    const res = await parser.parseCallData(ERC_20_STAKE_CALLDATA)
    assert.equal(res.name, 'executeBatch')
    assert.equal(res.targetFunctions[0].targetAddress, '0x34Ef2Cc892a88415e9f02b91BfA9c91fC0bE6bD4')
    assert.equal(res.targetFunctions[0].name, 'approve')
    assert.equal(res.targetFunctions[1].targetAddress, '0x97a6e78c9208c21afaDa67e7E61d7ad27688eFd1')
    assert.equal(res.targetFunctions[1].name, 'enter')
  })
  it('userOp ERC-20 token UNstake calldata', async () => {
    const res = await parser.parseCallData(ERC_20_UNSTAKE_CALLDATA)
    assert.equal(res.name, 'executeBatch')
    assert.equal(res.targetFunctions[0].targetAddress, '0xb1DD0B683d9A56525cC096fbF5eec6E60FE79871')
    assert.equal(res.targetFunctions[0].name, 'approve')
    assert.equal(res.targetFunctions[1].targetAddress, '0x97a6e78c9208c21afaDa67e7E61d7ad27688eFd1')
    assert.equal(res.targetFunctions[1].name, 'leave')
  })

  it('userOp NFT token transfer calldata', async () => {
    const res = await parser.parseCallData(TRANSFER_NFT_CALLDATA)
    assert.equal(res.name, 'execute')
    assert.equal(res.targetFunctions[0].targetAddress, '0x32319834d90323127988E4e2DC7b2162d4262904')
    assert.equal(res.targetFunctions[0].name, 'transferFrom')
    assert.equal(res.targetFunctions[0].callData[0], '0x5BBEA139C1b1b32CF7b5C7fD1D1fF802De006117')
    assert.equal(res.targetFunctions[0].callData[1], '0x5BBEA139C1b1b32CF7b5C7fD1D1fF802De006117')
  })

  it('swapExactETHForTokens function calldata', async () => {
    const res = await parser.parseCallData(SWAP_EXACT_ETH_FOR_TOKENS_CALLDATA)
    assert.equal(res.name, 'execute')
    assert.equal(res.targetFunctions[0].targetAddress, '0xE3F85aAd0c8DD7337427B9dF5d0fB741d65EEEB5')
    assert.equal(res.targetFunctions[0].name, 'swapExactETHForTokens')
    assert.equal(res.targetFunctions[0].callData[1][0], '0x0BE9e53fd7EDaC9F859882AfdDa116645287C629')
    assert.equal(res.targetFunctions[0].callData[1][1], '0x495d133B938596C9984d462F007B676bDc57eCEC')
    assert.equal(res.targetFunctions[0].callData[2], '0x5BBEA139C1b1b32CF7b5C7fD1D1fF802De006117')
  })

  it('swapETHForExactTokens function calldata', async () => {
    const res = await parser.parseCallData(SWAP_ETH_FOR_EXACT_TOKENS_CALLDATA)
    assert.equal(res.name, 'execute')
    assert.equal(res.targetFunctions[0].targetAddress, '0xE3F85aAd0c8DD7337427B9dF5d0fB741d65EEEB5')
    assert.equal(res.targetFunctions[0].name, 'swapETHForExactTokens')
    assert.equal(res.targetFunctions[0].callData[1][0], '0x0BE9e53fd7EDaC9F859882AfdDa116645287C629')
    assert.equal(res.targetFunctions[0].callData[1][1], '0x6a5F6A8121592BeCd6747a38d67451B310F7f156')
    assert.equal(res.targetFunctions[0].callData[2], '0xdf5bA6044f17Ec46B1F00c580916843E25996db9')
  })
  it('swapTokensForExactEth function calldata', async () => {
    const res = await parser.parseCallData(SWAP_TOKENS_FOR_EXACT_ETH_CALLDATA)
    assert.equal(res.name, 'executeBatch')
    assert.equal(res.targetFunctions[0].targetAddress, '0x34Ef2Cc892a88415e9f02b91BfA9c91fC0bE6bD4')
    assert.equal(res.targetFunctions[1].targetAddress, '0xE3F85aAd0c8DD7337427B9dF5d0fB741d65EEEB5')
    assert.equal(res.targetFunctions[0].targetAddress, '0x34Ef2Cc892a88415e9f02b91BfA9c91fC0bE6bD4')
    assert.equal(res.targetFunctions[1].name, 'swapTokensForExactETH')
    assert.equal(res.targetFunctions[1].callData[2][0], '0x6a5F6A8121592BeCd6747a38d67451B310F7f156') // BUSD
    assert.equal(res.targetFunctions[1].callData[2][1], '0x0BE9e53fd7EDaC9F859882AfdDa116645287C629') // Goodollar
    assert.equal(res.targetFunctions[1].callData[3], '0xdf5bA6044f17Ec46B1F00c580916843E25996db9')
  })

  it('swapExactTokensForEth function calldata', async () => {
    const res = await parser.parseCallData(SWAP_EXACT_TOKENS_FOR_ETH_CALLDATA)
    assert.equal(res.name, 'executeBatch')
    assert.equal(res.targetFunctions[0].targetAddress, '0x34Ef2Cc892a88415e9f02b91BfA9c91fC0bE6bD4')
    assert.equal(res.targetFunctions[1].targetAddress, '0xE3F85aAd0c8DD7337427B9dF5d0fB741d65EEEB5')
    assert.equal(res.targetFunctions[0].targetAddress, '0x34Ef2Cc892a88415e9f02b91BfA9c91fC0bE6bD4')
    assert.equal(res.targetFunctions[1].name, 'swapExactTokensForETH')
    assert.equal(res.targetFunctions[1].callData[2][0], '0x34Ef2Cc892a88415e9f02b91BfA9c91fC0bE6bD4') // Volt
    assert.equal(res.targetFunctions[1].callData[2][1], '0x0BE9e53fd7EDaC9F859882AfdDa116645287C629') // Goodollar
    assert.equal(res.targetFunctions[1].callData[3], '0xE65513Fe95F52F4350D2184c2fD722c37e6Fd995')
  })

  it('swapExactTokensForTokens function calldata', async () => {
    const res = await parser.parseCallData(SWAP_EXACT_TOKENS_TO_TOKENS_CALLDATA)
    assert.equal(res.name, 'executeBatch')
    assert.equal(res.targetFunctions[0].targetAddress, '0x495d133B938596C9984d462F007B676bDc57eCEC')
    assert.equal(res.targetFunctions[1].targetAddress, '0xE3F85aAd0c8DD7337427B9dF5d0fB741d65EEEB5')
    assert.equal(res.targetFunctions[0].name, 'approve')
    assert.equal(res.targetFunctions[0].targetAddress, '0x495d133B938596C9984d462F007B676bDc57eCEC') // Goodollar Approve
    assert.equal(res.targetFunctions[1].name, 'swapExactTokensForTokens')
    assert.equal(res.targetFunctions[1].callData[2][0], '0x495d133B938596C9984d462F007B676bDc57eCEC') // Goodollar
    assert.equal(res.targetFunctions[1].callData[2][1], '0x0BE9e53fd7EDaC9F859882AfdDa116645287C629') // WFUSE
    assert.equal(res.targetFunctions[1].callData[2][2], '0x588e24DEd8f850b14BB2e62E9c50A7Cd5Ee13Da9') // TerraLuna
    assert.equal(res.targetFunctions[1].callData[3], '0x5BBEA139C1b1b32CF7b5C7fD1D1fF802De006117')
  })

  it('userOp ERC-20 only batch transaction calldata', async () => {
    const res = await parser.parseCallData(BATCH_TRANSACTION_CALLDATA_ONLY_ERC20_TOKENS)
    assert.equal(res.targetFunctions[0].targetAddress, '0x495d133B938596C9984d462F007B676bDc57eCEC') // Goodollar
    assert.equal(res.targetFunctions[0].callData[0], '0xE65513Fe95F52F4350D2184c2fD722c37e6Fd995')
    assert.equal(res.targetFunctions[0].name, 'transfer')
    assert.equal(res.targetFunctions[1].targetAddress, '0x495d133B938596C9984d462F007B676bDc57eCEC') // Goodollar
    assert.equal(res.targetFunctions[1].callData[0], '0xE65513Fe95F52F4350D2184c2fD722c37e6Fd995')
    assert.equal(res.targetFunctions[0].name, 'transfer')
  })
  it('userOp batch transaction with native and ERC-20 tranfers calldata', async () => {
    const res = await parser.parseCallData(BATCH_TRANSACTION_CALLDATA)
    assert.equal(res.targetFunctions[0].targetAddress, '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') // Goodollar
    assert.equal(res.targetFunctions[0].name, 'nativeTransfer')
    assert.equal(res.targetFunctions[1].targetAddress, '0x495d133B938596C9984d462F007B676bDc57eCEC') // Goodollar
    assert.equal(res.targetFunctions[1].callData[0], '0xE65513Fe95F52F4350D2184c2fD722c37e6Fd995')
    assert.equal(res.targetFunctions[1].name, 'transfer')
    assert.equal(res.targetFunctions[2].targetAddress, '0x495d133B938596C9984d462F007B676bDc57eCEC') // Goodollar
    assert.equal(res.targetFunctions[2].callData[0], '0xE65513Fe95F52F4350D2184c2fD722c37e6Fd995')
    assert.equal(res.targetFunctions[2].name, 'transfer')
    assert.equal(res.targetFunctions[3].targetAddress, '0x495d133B938596C9984d462F007B676bDc57eCEC') // Goodollar
    assert.equal(res.targetFunctions[3].callData[0], '0xE65513Fe95F52F4350D2184c2fD722c37e6Fd995')
    assert.equal(res.targetFunctions[3].name, 'transfer')
  })

  // it("swapTokensForExactTokens function calldata", async () => {
  //     const res = await parser.parseCallData(SWAP_TOKENS_TO_EXACT_TOKENS_CALLDATA)
  //     // assert.equal(res.name, 'execute')
  // assert.equal(res.calls[0].targetAddress, '0xE3F85aAd0c8DD7337427B9dF5d0fB741d65EEEB5')
  //     // assert.equal(targetFunction[1].name, 'swapTokensForExactTokens')
  //     // assert.equal(targetFunction[0].arguments[1][0], '0x495d133B938596C9984d462F007B676bDc57eCEC') //Goodollar
  //     // assert.equal(targetFunction[0].arguments.pop(), '0x588e24DEd8f850b14BB2e62E9c50A7Cd5Ee13Da9') //TerraLuna
  //     // assert.equal(targetFunction[1].arguments[2], '0x5BBEA139C1b1b32CF7b5C7fD1D1fF802De006117')
  // });
})
