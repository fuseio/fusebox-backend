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

  const sig = await wallet.signMessage(ethers.utils.arrayify(hash))
  console.log(`sig: ${sig}`);

  return { hash, sig }
}

export async function recoverPublicAddress(hash, sig) {
  // Now you have the digest,
  let publicKey = recoverPublicKey(arrayify(hashMessage(arrayify(hash))), sig);

  const recoveredAddress = computeAddress(publicKey)
  console.log(`recoveredAddress: ${recoveredAddress}`);

  return recoveredAddress
}