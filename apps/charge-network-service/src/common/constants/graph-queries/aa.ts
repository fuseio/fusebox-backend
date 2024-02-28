import { gql } from 'graphql-request'

export const getUserOpsBySender = gql`
    query getUserOpsBySender($sender: String!) {
        userOps(where:{sender: $sender}, orderBy: blockTime, orderDirection: desc) {
            id
            transactionHash
            userOpHash
            sender
            entryPoint
            paymaster
            paymasterAndData
            bundler
            nonce
            initCode
            actualGasCost
            actualGasUsed
            callGasLimit
            verificationGasLimit
            preVerificationGas
            maxFeePerGas
            maxPriorityFeePerGas
            baseFeePerGas
            gasPrice
            gasLimit
            signature
            success
            revertReason
            blockTime
            blockNumber
            network
            target
            accountTarget {
                id
                userOpsCount
            }
            callData
            beneficiary
            factory
            erc20Transfers {
                id
                from
                to
                value
                contractAddress
                name
                symbol
                decimals
            }
            erc721Transfers {
                id
                from
                to
                contractAddress
                tokenId
                name
                symbol
            }
        }
    }
`
