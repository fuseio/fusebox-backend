
interface ERC20TransferInterface {
    name: string;
    symbol: string;
    address: string;
    decimals: number;
    value: string;
    to: string;
    type: string;
}
interface ERC721TransferInterface {
    name: string;
    symbol: string;
    address: string;
    decimals: number;
    value: string;
    to: string;
    type: string;
    tokenId: number;
}
interface FetchedTokenInterface {
    name: string;
    symbol: string;
    totalSupply: string;
    decimals: number;
}

export { ERC20TransferInterface, ERC721TransferInterface, FetchedTokenInterface }
