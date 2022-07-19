import { Filter } from '@ethersproject/providers'

export default interface IEventFilter {
  name: string;
  type: string;
  event: string;
  filter: Filter;
  abi: any;
}
