import { id } from '@ethersproject/hash'

export const ERC20_TRANSFER_TO_EVENT_NAME = 'erc20-transfers-to'

export const ERC20_TRANSFER_EVENT_SIG = 'Transfer(address,address,uint256)'

export const ERC20_TRANSFER_EVENT_HASH = id(ERC20_TRANSFER_EVENT_SIG)

export const SUPPORTED_EVENTS = [ERC20_TRANSFER_TO_EVENT_NAME]
