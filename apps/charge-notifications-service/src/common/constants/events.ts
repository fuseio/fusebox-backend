import { id } from '@ethersproject/hash'

export const ERC20_TRANSFER_EVENT_SIG = 'Transfer(address,address,uint256)'

export const ERC20_TRANSFER_EVENT_HASH = id(ERC20_TRANSFER_EVENT_SIG)
