interface ERC20Transfer {
    name: string;
    symbol: string;
    address: string;
    decimals: number;
    type: string;
    to?: string;
    from?: string
    value?: string;
}

interface ERC721Transfer {
    name: string;
    symbol: string;
    address: string;
    decimals: number;
    from?: string;
    to: string;
    type: string;
    tokenId: number;
}

interface Token {
    name: string;
    symbol: string;
    address: string;
    decimals: number;
}

export { ERC20Transfer, ERC721Transfer, Token }
