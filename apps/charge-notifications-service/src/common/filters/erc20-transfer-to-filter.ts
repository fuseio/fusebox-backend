import ABI from '@app/notifications-service/common/constants/abi/erc20.json'
import { ERC20_TRANSFER_TO_EVENT_NAME } from '@app/notifications-service/common/constants/events'
import IEventFilter from '@app/notifications-service/common/interfaces/event-filter.interface'
import { id } from '@ethersproject/hash'

const filter: IEventFilter = {
  name: 'erc20Transfer',
  type: 'eventFilter',
  event: ERC20_TRANSFER_TO_EVENT_NAME,
  filter: {
    topics: [id('Transfer(address,address,uint256)')]
  },
  abi: ABI
}

export default filter
