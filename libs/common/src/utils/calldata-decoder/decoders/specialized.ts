import { ethers } from 'ethers'
import { Logger } from '@nestjs/common'
import { startHexWith0x } from '../utils'
import { guessAbiEncodedData, guessFragment } from '@openchainxyz/abi-guesser'
import { hexToBigInt } from 'viem'

const logger = new Logger('SpecializedDecoders')

export const decodeSafeMultiSendTransactionsParam = (bytes: string) => {

    try {
        const transactionsParam = bytes.slice(2)
        const txs: any[] = []
        let i = 0
        for (; i < transactionsParam.length;) {
            const operationEnd = i + 1 * 2
            const operation = transactionsParam.slice(i, operationEnd)
            if (operation === '') {
                throw new Error(
                    'Failed to decode operation in SafeMultiSend transactions param'
                )
            }

            const toEnd = operationEnd + 20 * 2
            const _to = transactionsParam.slice(operationEnd, toEnd)
            if (_to === '') {
                throw new Error(
                    'Failed to decode to in SafeMultiSend transactions param'
                )
            }
            const to = '0x' + _to

            const valueEnd = toEnd + 32 * 2
            const _value = transactionsParam.slice(toEnd, valueEnd)
            if (_value === '') {
                throw new Error(
                    'Failed to decode value in SafeMultiSend transactions param'
                )
            }
            const value = hexToBigInt(startHexWith0x(_value)).toString()

            const dataLengthEnd = valueEnd + 32 * 2
            const _dataLength = transactionsParam.slice(valueEnd, dataLengthEnd)
            if (_dataLength === '') {
                throw new Error(
                    'Failed to decode dataLength in SafeMultiSend transactions param'
                )
            }
            const dataLength = hexToBigInt(startHexWith0x(_dataLength)).toString()

            const dataEnd = dataLengthEnd + parseInt(dataLength) * 2
            const _data = transactionsParam.slice(dataLengthEnd, dataEnd)
            if (parseInt(dataLength) !== 0 && _data === '') {
                throw new Error(
                    'Failed to decode data in SafeMultiSend transactions param'
                )
            }
            const data = '0x' + _data

            txs.push([operation, to, value, dataLength, data])

            i = dataEnd
        }

        if (i == 0 || i !== transactionsParam.length) {
            throw new Error(
                'Failed to decode calldata as SafeMultiSend transactions param'
            )
        }

        const result = {
            name: '',
            args: ethers.utils.defaultAbiCoder.encode(['tuple(uint256,address,uint256,uint256,bytes)[]'], [txs]),
            signature: 'transactions(tuple(uint256,address,uint256,uint256,bytes)[])',
            selector: '',
            value: ethers.BigNumber.from(0),
            fragment: {
                name: 'transactions',
                type: 'function',
                stateMutability: 'nonpayable',
                inputs: [
                    {
                        name: '',
                        type: 'tuple(uint256,address,uint256,uint256,bytes)[]',
                        baseType: 'array',
                        arrayLength: -1,
                        arrayChildren: {
                            name: '',
                            type: 'tuple(uint256,address,uint256,uint256,bytes)',
                            baseType: 'tuple',
                            components: [
                                {
                                    name: 'operation',
                                    type: 'uint256',
                                    baseType: 'uint256',
                                    indexed: null,
                                    components: null,
                                    arrayLength: null,
                                    arrayChildren: null
                                },
                                {
                                    name: 'to',
                                    type: 'address',
                                    indexed: null,
                                    components: null,
                                    arrayLength: null,
                                    arrayChildren: null,
                                    baseType: 'address'
                                },
                                {
                                    name: 'value',
                                    type: 'uint256',
                                    indexed: null,
                                    components: null,
                                    arrayLength: null,
                                    arrayChildren: null,
                                    baseType: 'uint256'
                                },
                                {
                                    name: 'dataLength',
                                    type: 'uint256',
                                    indexed: null,
                                    components: null,
                                    arrayLength: null,
                                    arrayChildren: null,
                                    baseType: 'uint256'
                                },
                                {
                                    name: 'data',
                                    type: 'bytes',
                                    indexed: null,
                                    components: null,
                                    arrayLength: null,
                                    arrayChildren: null,
                                    baseType: 'bytes'
                                }
                            ]
                        }
                    }
                ],
                outputs: []
            }
        }

        return result
    } catch (error) {
        logger.error('Failed to decode calldata as SafeMultiSend transactions param', error.stack)
        throw error
    }
}

export const decodeUniversalRouterPath = (calldata: string) => {

    try {
        const path = calldata.slice(2)
        const tokenA = '0x' + path.slice(0, 40)
        const fee = parseInt(path.slice(40, 46), 16)
        const tokenB = '0x' + path.slice(46, 86)

        const result = {
            name: '',
            args: ethers.utils.defaultAbiCoder.encode(['address', 'uint24', 'address'], [tokenA, fee, tokenB]),
            value: ethers.BigNumber.from(0),
            signature: 'path(address,uint24,address)',
            selector: '',
            fragment: {
                name: 'path',
                type: 'function',
                stateMutability: 'nonpayable',
                inputs: [
                    {
                        name: 'tokenA',
                        type: 'address',
                        indexed: null,
                        components: null,
                        arrayLength: null,
                        arrayChildren: null,
                        baseType: 'address',
                        _isParamType: true
                    },
                    {
                        name: 'fee',
                        type: 'uint24',
                        indexed: null,
                        components: null,
                        arrayLength: null,
                        arrayChildren: null,
                        baseType: 'uint24',
                        _isParamType: true
                    },
                    {
                        name: 'tokenB',
                        type: 'address',
                        indexed: null,
                        components: null,
                        arrayLength: null,
                        arrayChildren: null,
                        baseType: 'address',
                        _isParamType: true
                    }
                ],
                outputs: []
            }
        }

        return result
    } catch (error) {
        logger.error('Failed to decode calldata as UniversalRouter path', error.stack)
        throw error
    }
}

export const decodeABIEncodedData = (calldata: string) => {
    try {

        const decoded = guessAbiEncodedData(calldata)
        if (!decoded) {
            throw new Error('Failed to decode ABI encoded data')
        }
        const result = {
            name: '',
            args: ethers.utils.defaultAbiCoder.encode(
                decoded.map(d => d.type),
                decoded
            ),
            signature: `abi.encode${decoded.map((d) => d.type).join(',')}`,
            selector: '',
            value: ethers.BigNumber.from(0),
            fragment: {
                name: '',
                type: 'function',
                stateMutability: 'nonpayable',
                inputs: decoded.map((d, i) => ({
                    name: `arg${i}`,
                    type: d.type,
                    baseType: d.type,
                    indexed: null,
                    components: null,
                    arrayLength: null,
                    arrayChildren: null
                })),
                outputs: []
            }
        }

        return result
    } catch (error) {
        logger.error(`Failed to decode ABI encoded data ${calldata}`, error.stack)
        throw error
    }
}

export const decodeUniversalRouterCommands = (calldata: string) => {

    try {
        const commandByteToString: { [command: string]: string } = {
            '00': 'V3_SWAP_EXACT_IN',
            '01': 'V3_SWAP_EXACT_OUT',
            '02': 'PERMIT2_TRANSFER_FROM',
            '03': 'PERMIT2_PERMIT_BATCH',
            '04': 'SWEEP',
            '05': 'TRANSFER',
            '06': 'PAY_PORTION',
            '08': 'V2_SWAP_EXACT_IN',
            '09': 'V2_SWAP_EXACT_OUT',
            '0a': 'PERMIT2_PERMIT',
            '0b': 'WRAP_ETH',
            '0c': 'UNWRAP_WETH',
            '0d': 'PERMIT2_TRANSFER_FROM_BATCH',
            '0e': 'BALANCE_CHECK_ERC20',
            10: 'SEAPORT_V1_5',
            11: 'LOOKS_RARE_V2',
            12: 'NFTX',
            13: 'CRYPTOPUNKS',
            15: 'OWNER_CHECK_721',
            16: 'OWNER_CHECK_1155',
            17: 'SWEEP_ERC721',
            18: 'X2Y2_721',
            19: 'SUDOSWAP',
            '1a': 'NFT20',
            '1b': 'X2Y2_1155',
            '1c': 'FOUNDATION',
            '1d': 'SWEEP_ERC1155',
            '1e': 'ELEMENT_MARKET',
            20: 'SEAPORT_V1_4',
            21: 'EXECUTE_SUB_PLAN',
            22: 'APPROVE_ERC20'
        }

        const commands = calldata.slice(2).match(/.{1,2}/g) || []
        const decodedCommands = commands.map((command) => commandByteToString[command] || command)

        const result = {
            name: '',
            args: ethers.utils.defaultAbiCoder.encode(['string[]'], [decodedCommands]),
            signature: 'commands(string[])',
            selector: '',
            value: ethers.BigNumber.from(0),
            fragment: {
                name: '',
                type: 'function',
                stateMutability: 'nonpayable',
                inputs: [
                    {
                        name: 'commands',
                        type: 'string[]',
                        indexed: null,
                        components: null,
                        arrayLength: -1,
                        arrayChildren: {
                            name: null,
                            type: 'string',
                            indexed: null,
                            components: null,
                            arrayLength: null,
                            arrayChildren: null,
                            baseType: 'string',
                            _isParamType: true
                        },
                        baseType: 'array',
                        _isParamType: true
                    }
                ],
                outputs: []
            }
        }

        return result
    } catch (error) {
        logger.error('Failed to decode calldata as UniversalRouter commands', error.stack)
        throw error
    }
}

export const decodeByGuessingFunctionFragment = (calldata: string) => {
    const selector = calldata.slice(0, 10)
    try {
        const frag = guessFragment(calldata)
        if (!frag) {
            throw new Error('Failed to guess function fragment')
        }
        const paramTypes = frag.format()
        const fragment = ethers.utils.FunctionFragment.from(paramTypes)
        const abiCoder = ethers.utils.defaultAbiCoder
        const decoded = abiCoder.decode(
            fragment.inputs,
            '0x' + calldata.substring(10)
        )
        const result: ethers.utils.TransactionDescription = {
            name: fragment.name,
            args: decoded,
            signature: fragment.format(),
            sighash: selector,
            value: ethers.BigNumber.from(0),
            functionFragment: fragment
        }
        return result
    } catch (error) {
        logger.error(
            `Failed to decode using guessed function fragment for calldata ${calldata}`,
            error.stack
        )
        throw error
    }
}
