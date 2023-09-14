import Web3 from 'web3'
import { NATIVE_FUSE_TOKEN } from '@app/smart-wallets-service/common/constants/fuseTokenInfo'
const BasicTokenAbi = require('@app/smart-wallets-service/common/config/abi/BasicToken.json')
const web3 = new Web3(new Web3.providers.HttpProvider('https://rpc.fuse.io'))

export const fetchERC20Data = async (address) => {
  if (address === NATIVE_FUSE_TOKEN.address) {
    return {
      name: NATIVE_FUSE_TOKEN.name,
      address: NATIVE_FUSE_TOKEN.address,
      symbol: NATIVE_FUSE_TOKEN.symbol,
      decimals: 18
    }
  }
  const tokenContractInstance = new web3.eth.Contract(BasicTokenAbi, address)
  const [name, symbol, totalSupply, decimals] = await Promise.all([
    tokenContractInstance.methods.name().call(),
    tokenContractInstance.methods.symbol().call(),
    tokenContractInstance.methods.totalSupply().call(),
    tokenContractInstance.methods.decimals().call()
  ])
  const fetchedTokedData = { name, symbol, totalSupply: totalSupply.toString(), decimals }
  return fetchedTokedData
}

export const fetchNftData = async (address) => {
  const tokenContractInstance = new web3.eth.Contract(BasicTokenAbi, address)
  const [name, symbol, totalSupply] = await Promise.all([
    tokenContractInstance.methods.name().call(),
    tokenContractInstance.methods.symbol().call(),
    tokenContractInstance.methods.totalSupply().call()
  ])
  const fetchedTokedData = { name, symbol, totalSupply: totalSupply.toString() }
  return fetchedTokedData
}
