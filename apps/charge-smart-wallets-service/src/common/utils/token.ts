import Web3 from 'web3'
import { NATIVE_FUSE_ADDRESS } from '@app/notifications-service/common/constants/addresses'
const BasicTokenAbi = require('@app/smart-wallets-service/common/config/abi/BasicToken.json')
const web3 = new Web3(new Web3.providers.HttpProvider('https://rpc.fuse.io'))

export const fetchERC20Data = async (address) => {
  if (address === NATIVE_FUSE_ADDRESS) {
    return {
      name: 'Fuse',
      address: NATIVE_FUSE_ADDRESS,
      symbol: 'FUSE',
      decimals: 18
    }
  }
  try {
    const tokenContractInstance = new web3.eth.Contract(BasicTokenAbi, address)
    const [name, symbol, totalSupply, decimals] = await Promise.all([
      tokenContractInstance.methods.name().call(),
      tokenContractInstance.methods.symbol().call(),
      tokenContractInstance.methods.totalSupply().call(),
      tokenContractInstance.methods.decimals().call()
    ])
    const fetchedTokedData = { name, symbol, totalSupply: totalSupply.toString(), decimals }
    return fetchedTokedData
  } catch (error) {
    console.log(error)
  }
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
