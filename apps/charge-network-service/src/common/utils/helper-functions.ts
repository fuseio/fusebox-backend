import Web3 from 'web3'

function getFunctionAbi (abi: Array<any>, functionName: string) {
  const functionAbi = abi.find(abiObj => abiObj.type === 'function' && abiObj.name === functionName)
  if (!functionAbi) throw Error('Failed to find function name in abi')

  return functionAbi
}

export function encodeFunctionCall (abi: any, web3: Web3, functionName: string, params: Array<any>) {
  return web3.eth.abi.encodeFunctionCall(getFunctionAbi(abi, functionName), params)
}

export function aprToApy (interest: number, frequency: number) {
  return ((1 + (interest / 100) / frequency) ** frequency - 1) * 100
}
