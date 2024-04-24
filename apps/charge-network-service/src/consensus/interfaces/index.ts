export interface IValidator {
    address: string
    stakeAmount: string
    fee: string
    delegatorsLength: string
    delegators: { [address: string]: { amount: string; amountFormatted: string } };
    name?: string
    website?: string
    firstSeen?: string
    status?: string
    image?: string
    forDelegation?: boolean
    totalValidated?: number
    uptime?: number
    description?: string
    isPending?: boolean
    isJailed?: boolean,
}
