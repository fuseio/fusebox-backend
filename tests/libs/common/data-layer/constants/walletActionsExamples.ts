import { BigNumber } from '@ethersproject/bignumber'

export const NATIVE_TOKEN_TRANSFER_WALLET_ACTION = {
  walletAddress: '0x5bbea139c1b1b32cf7b5c7fd1d1ff802de006117',
  name: 'tokenTransfer',
  status: 'pending',
  sent: [
    {
      name: 'Fuse Token',
      symbol: 'FUSE',
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      decimals: 18,
      type: 'native',
      value: '0',
      to: '0x5BBEA139C1b1b32CF7b5C7fD1D1fF802De006117'
    }
  ],
  userOpHash: '0x111',
  txHash: '',
  blockNumber: 0,
  description: 'Transferred 0.0 FUSE'
}
export const NFT_TOKEN_TRANSFER_WALLET_ACTION = {
  walletAddress: '0x5bbea139c1b1b32cf7b5c7fd1d1ff802de006117',
  name: 'nftTransfer',
  status: 'pending',
  sent: [
    {
      type: 'ERC-721',
      name: 'Cozy Cosmonauts',
      symbol: 'COZY',
      decimals: 0,
      address: '0x32319834d90323127988E4e2DC7b2162d4262904',
      to: '0x5BBEA139C1b1b32CF7b5C7fD1D1fF802De006117',
      tokenId: BigNumber.from('0x01')
    }
  ],
  userOpHash: '0x111',
  txHash: '',
  blockNumber: 0,
  description: 'COZY #1 sent to 0x5BBEA139C1b1b32CF7b5C7fD1D1fF802De006117'
}
export const SWAP_EXACT_TOKENS_TO_TOKENS_WALLET_ACTION = {
  name: 'swapTokens',
  walletAddress: '0x5bbea139c1b1b32cf7b5c7fd1d1ff802de006117',
  status: 'pending',
  sent: [
    {
      type: 'ERC-20',
      name: 'GoodDollar',
      symbol: 'G$',
      decimals: 2,
      address: '0x495d133B938596C9984d462F007B676bDc57eCEC',
      to: '0x5BBEA139C1b1b32CF7b5C7fD1D1fF802De006117',
      value: '1'
    }
  ],
  received: [
    {
      type: 'ERC-20',
      name: 'Luna Terra',
      symbol: 'atLUNA',
      decimals: 18,
      address: '0x588e24DEd8f850b14BB2e62E9c50A7Cd5Ee13Da9',
      value: '12320154038834973',
      to: '0x5bbea139c1b1b32cf7b5c7fd1d1ff802de006117'
    }
  ],
  userOpHash: '0x111',
  txHash: '',
  blockNumber: 0,
  description: '0.01 G$ was swapped to 0.012320154038834973 atLUNA'
}
export const SWAP_TOKENS_FOR_EXACT_ETH_WALLET_ACTION = {
  name: 'swapTokens',
  walletAddress: '0x5bbea139c1b1b32cf7b5c7fd1d1ff802de006117',
  status: 'pending',
  sent: [
    {
      type: 'ERC-20',
      name: 'Binance USD on Fuse',
      symbol: 'BUSD',
      decimals: 18,
      address: '0x6a5F6A8121592BeCd6747a38d67451B310F7f156',
      to: '0xdf5bA6044f17Ec46B1F00c580916843E25996db9',
      value: '42746044759044'
    }
  ],
  received: [
    {
      type: 'native',
      name: 'Fuse Token',
      symbol: 'FUSE',
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      decimals: 18,
      value: '1000000000000000',
      to: '0x5bbea139c1b1b32cf7b5c7fd1d1ff802de006117'
    }
  ],
  userOpHash: '0x111',
  txHash: '',
  blockNumber: 0,
  description: '0.000042746044759044 BUSD was swapped to 0.001 FUSE'
}
export const SWAP_EXACT_ETH_FOR_TOKENS_WALLET_ACTION = {
  name: 'swapTokens',
  walletAddress: '0x5bbea139c1b1b32cf7b5c7fd1d1ff802de006117',
  status: 'pending',
  sent: [
    {
      type: 'native',
      name: 'Fuse Token',
      symbol: 'FUSE',
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      decimals: 18,
      to: '0x5BBEA139C1b1b32CF7b5C7fD1D1fF802De006117',
      value: '10000000000000000'
    }
  ],
  received: [
    {
      type: 'ERC-20',
      name: 'GoodDollar',
      symbol: 'G$',
      decimals: 2,
      address: '0x495d133B938596C9984d462F007B676bDc57eCEC',
      value: '233',
      to: '0x5bbea139c1b1b32cf7b5c7fd1d1ff802de006117'
    }
  ],
  userOpHash: '0x111',
  txHash: '',
  blockNumber: 0,
  description: '0.01 FUSE was swapped to 2.33 G$'
}
export const SWAP_EXACT_TOKENS_FOR_ETH_WALLET_ACTION = {
  name: 'swapTokens',
  walletAddress: '0x5bbea139c1b1b32cf7b5c7fd1d1ff802de006117',
  status: 'pending',
  sent: [
    {
      type: 'ERC-20',
      name: 'VoltToken',
      symbol: 'VOLT',
      decimals: 18,
      address: '0x34Ef2Cc892a88415e9f02b91BfA9c91fC0bE6bD4',
      to: '0xE65513Fe95F52F4350D2184c2fD722c37e6Fd995',
      value: '1000000000000000000'
    }
  ],
  received: [
    {
      type: 'native',
      name: 'Fuse Token',
      symbol: 'FUSE',
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      decimals: 18,
      value: '3213569384737440',
      to: '0x5bbea139c1b1b32cf7b5c7fd1d1ff802de006117'
    }
  ],
  userOpHash: '0x111',
  txHash: '',
  blockNumber: 0,
  description: '1.0 VOLT was swapped to 0.00321356938473744 FUSE'
}
export const SWAP_ETH_FOR_EXACT_TOKENS_WALLET_ACTION = {
  name: 'swapTokens',
  walletAddress: '0x5bbea139c1b1b32cf7b5c7fd1d1ff802de006117',
  status: 'pending',
  sent: [
    {
      type: 'ERC-20',
      name: 'Wrapped Fuse',
      symbol: 'WFUSE',
      decimals: 18,
      address: '0x0BE9e53fd7EDaC9F859882AfdDa116645287C629',
      to: '0xdf5bA6044f17Ec46B1F00c580916843E25996db9',
      value: '10000000000000000'
    }
  ],
  received: [
    {
      type: 'native',
      name: 'Fuse Token',
      symbol: 'FUSE',
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      decimals: 18,
      value: '4000000000000000',
      to: '0x5bbea139c1b1b32cf7b5c7fd1d1ff802de006117'
    }
  ],
  userOpHash: '0x111',
  txHash: '',
  blockNumber: 0,
  description: '0.01 WFUSE was swapped to 0.004 FUSE'
}
export const ERC_20_TOKEN_UNSTAKE_WALLET_ACTION = {
  name: 'unstakeTokens',
  walletAddress: '0x5bbea139c1b1b32cf7b5c7fd1d1ff802de006117',
  status: 'pending',
  received: [
    {
      name: 'VoltToken',
      symbol: 'VOLT',
      decimals: 18,
      address: '0x34Ef2Cc892a88415e9f02b91BfA9c91fC0bE6bD4',
      to: '0x5bbea139c1b1b32cf7b5c7fd1d1ff802de006117',
      type: 'ERC-20',
      value: '0'
    }
  ],
  sent: [
    {
      name: 'VoltBar',
      symbol: 'xVOLT',
      decimals: 18,
      address: '0x97a6e78c9208c21afaDa67e7E61d7ad27688eFd1',
      to: '0xb1DD0B683d9A56525cC096fbF5eec6E60FE79871',
      type: 'ERC-20',
      value: '900000000000000000'
    }
  ],
  userOpHash: '0x111',
  txHash: '',
  blockNumber: 0,
  description: 'Unstake 0.9 xVOLT'
}
export const ERC_20_TOKEN_STAKE_WALLET_ACTION = {
  name: 'stakeTokens',
  walletAddress: '0x5bbea139c1b1b32cf7b5c7fd1d1ff802de006117',
  status: 'pending',
  sent: [
    {
      type: 'ERC-20',
      name: 'VoltToken',
      symbol: 'VOLT',
      decimals: 18,
      address: '0x34Ef2Cc892a88415e9f02b91BfA9c91fC0bE6bD4',
      value: '1000000000000000000',
      to: '0x97a6e78c9208c21afaDa67e7E61d7ad27688eFd1'
    }
  ],
  received: [
    {
      type: 'ERC-20',
      name: 'VoltBar',
      symbol: 'xVOLT',
      decimals: 18,
      address: '0x97a6e78c9208c21afaDa67e7E61d7ad27688eFd1',
      value: '0',
      from: '0x0000000000000000000000000000000000000000'
    }
  ],
  userOpHash: '0x111',
  txHash: '',
  blockNumber: 0,
  description: 'Staked 1.0 VOLT'
}
export const UNSTAKE_NATIVE_TOKENS_WALLET_ACTION = {
  name: 'unstakeTokens',
  walletAddress: '0x5bbea139c1b1b32cf7b5c7fd1d1ff802de006117',
  status: 'pending',
  received: [
    {
      name: 'Fuse Token',
      symbol: 'FUSE',
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      decimals: 18,
      to: '0x5bbea139c1b1b32cf7b5c7fd1d1ff802de006117',
      type: 'native',
      value: '0'
    }
  ],
  sent: [
    {
      name: 'Liquid staked Fuse',
      symbol: 'sFUSE',
      decimals: 18,
      address: '0xb1DD0B683d9A56525cC096fbF5eec6E60FE79871',
      to: '0xa3dc222eC847Aac61FB6910496295bF344Ea46be',
      type: 'ERC-20',
      value: '159514909830694585'
    }
  ],
  userOpHash: '0x111',
  txHash: '',
  blockNumber: 0,
  description: 'Unstake 0.159514909830694585 sFUSE'
}

export const STAKE_NATIVE_TOKEN_WALLET_ACTION = {
  name: 'stakeTokens',
  walletAddress: '0x5bbea139c1b1b32cf7b5c7fd1d1ff802de006117',
  status: 'pending',
  sent: [
    {
      type: 'native',
      name: 'Fuse Token',
      symbol: 'FUSE',
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      decimals: 18,
      value: '100000000000000000',
      to: '0xa3dc222eC847Aac61FB6910496295bF344Ea46be'
    }
  ],
  received: [
    {
      type: 'ERC-20',
      name: 'Liquid staked Fuse',
      symbol: 'sFUSE',
      decimals: 18,
      address: '0xb1DD0B683d9A56525cC096fbF5eec6E60FE79871',
      value: '0',
      from: '0x0000000000000000000000000000000000000000'
    }
  ],
  userOpHash: '0x111',
  txHash: '',
  blockNumber: 0,
  description: 'Staked 0.1 FUSE'
}
export const APPROVE_TOKEN_WALLET_ACTION = {
  name: 'approveToken',
  walletAddress: '0x5bbea139c1b1b32cf7b5c7fd1d1ff802de006117',
  status: 'pending',
  sent: [
    {
      type: 'ERC-20',
      name: 'GoodDollar',
      symbol: 'G$',
      decimals: 2,
      address: '0x495d133B938596C9984d462F007B676bDc57eCEC',
      to: '0x5BBEA139C1b1b32CF7b5C7fD1D1fF802De006117',
      value: '1000000'
    }
  ],
  userOpHash: '0x111',
  txHash: '',
  blockNumber: 0,
  description: 'Approved 10000.0 G$'
}
export const ERC_20_TRANSFER_WALLET_ACTION = {
  walletAddress: '0x5bbea139c1b1b32cf7b5c7fd1d1ff802de006117',
  name: 'tokenTransfer',
  status: 'pending',
  sent: [
    {
      name: 'Flambucks',
      symbol: 'Fmb',
      decimals: 18,
      address: '0xb1232fD89d027e4B949cED570609e8aD0e18811e',
      type: 'ERC-20',
      to: '0xcc95E80DA76bd41507b99d9b977Dc3062bcf6430',
      value: '1000000000000000000'
    }
  ],
  userOpHash: '0x111',
  txHash: '',
  blockNumber: 0,
  description: 'Transferred 1.0 Fmb'
}
