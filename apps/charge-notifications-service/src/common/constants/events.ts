import { id } from 'nestjs-ethers'

export const ERC20_TRANSFER_EVENT_SIG = 'Transfer(address,address,uint256)'
export const ENTRY_POINT_USER_OP_EVENT_SIG = 'UserOperationEvent(bytes32,address,address,uint256,bool,uint256,uint256)	'

export const ERC20_TRANSFER_EVENT_HASH = id(ERC20_TRANSFER_EVENT_SIG)
export const ENTRY_POINT_USER_OP_EVENT_HASH = id(ENTRY_POINT_USER_OP_EVENT_SIG)
