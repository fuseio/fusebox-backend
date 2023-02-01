import { ethers } from "ethers";
import { arrayify, computeAddress, hashMessage, recoverPublicKey } from "nestjs-ethers";

module.exports.init = async function () {
}

export async function getHashAndSig(privateKey) {
  let wallet = new ethers.Wallet(privateKey);

  const ethAddress = await wallet.getAddress()
  console.log(`wallet address: ${ethAddress}`);

  const hash = await ethers.utils.keccak256(ethAddress)
  console.log(`hash: ${hash}`);

  const signature = await wallet.signMessage(ethers.utils.arrayify(hash))
  console.log(`signature: ${signature}`);

  return { hash, signature }
}

export async function recoverPublicAddress(hash, signature) {
  // Now you have the digest,
  let publicKey = recoverPublicKey(arrayify(hashMessage(arrayify(hash))), signature);

  const recoveredAddress = computeAddress(publicKey)
  console.log(`recoveredAddress: ${recoveredAddress}`);

  return recoveredAddress
}