export interface BalanceService {
  getERC20TokenBalances(address: string): Promise<any>;
  getERC721TokenBalances(address: string): Promise<any>;
}
