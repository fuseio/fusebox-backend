import { ethers, Contract, utils, providers } from 'ethers'
import { arrayify, computeAddress, hashMessage, recoverPublicKey } from 'nestjs-ethers'

module.exports.init = async function () {
}

export async function getHashAndSig (privateKey) {
  const wallet = new ethers.Wallet(privateKey)

  const ethAddress = await wallet.getAddress()
  console.log(`wallet address: ${ethAddress}`)

  const hash = await ethers.utils.keccak256(ethAddress)
  console.log(`hash: ${hash}`)

  const signature = await wallet.signMessage(ethers.utils.arrayify(hash))
  console.log(`signature: ${signature}`)

  return { hash, signature }
}

export async function recoverPublicAddress (hash, signature) {
  // Now you have the digest,
  const publicKey = recoverPublicKey(arrayify(hashMessage(arrayify(hash))), signature)

  const recoveredAddress = computeAddress(publicKey)
  console.log(`recoveredAddress: ${recoveredAddress}`)

  return recoveredAddress
}

const ERC1271 = [
  'function isValidSignature(bytes32 _message, bytes _signature) public view returns (bool)'
]

export async function isValidSignature (signingAddress, message, signature): Promise<Boolean> {
  const hash = utils.hashMessage(message)
  const provider = new providers.JsonRpcProvider('https://rpc.fuse.io')
  const bytecode = await provider.getCode(signingAddress)
  const isSmartContract = bytecode && utils.hexStripZeros(bytecode) !== '0x'
  if (isSmartContract) {
    // verify the message for a decentralized account (contract wallet)
    const contractWallet = new Contract(signingAddress, ERC1271, provider)
    const verification = await contractWallet.isValidSignature(hash, signature)
    console.log('Message is verified?', verification)
    return verification
  } else {
    return false
  }
}
