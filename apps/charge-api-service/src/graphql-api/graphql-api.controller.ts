import { Controller, Get, Param, UseGuards } from '@nestjs/common'
import { IsValidPublicApiKeyGuard } from '@app/api-service/api-keys/guards/is-valid-public-api-key.guard'
import { GraphqlAPIService } from '@app/api-service/graphql-api/graphql-api.service'
import { ApiBody, ApiCreatedResponse, ApiForbiddenResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'

@ApiTags('GraphQL')
@UseGuards(IsValidPublicApiKeyGuard)
@Controller('v0/graphql')
export class GraphqlAPIController {
  constructor (
    private readonly graphqlAPIService: GraphqlAPIService
  ) { }

  @Get('collectibles/:address')
  @ApiOperation({
    summary: 'Retrieves NFTs associated with a specific wallet address, including details like creation time, token ID, and collection information.'
  })
  @ApiParam({ name: 'apiKey', type: String, required: true })
  @ApiParam({ name: 'address', type: String, required: true })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            account: {
              type: 'object',
              properties: {
                address: {
                  type: 'string',
                  example: '0x1234567890abcdef'
                },
                id: {
                  type: 'string',
                  example: '0x1234567890abcdef'
                },
                collectibles: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      collection: {
                        type: 'object',
                        properties: {
                          collectionName: {
                            type: 'string',
                            example: '0x1234567890abcdef'
                          },
                          collectionSymbol: {
                            type: 'string',
                            example: 'CryptoKitties'
                          },
                          collectionAddress: {
                            type: 'string',
                            example: 'CryptoKitties'
                          }
                        }
                      },
                      id: {
                        type: 'string'
                      },
                      tokenId: {
                        type: 'string'
                      },
                      description: {
                        type: 'string'
                      },
                      descriptionUrl: {
                        type: 'string'
                      },
                      name: {
                        type: 'string',
                        example: 'Kitty'
                      },
                      imageURL: {
                        type: 'string'
                      },
                      creator: {
                        type: 'object',
                        properties: {
                          id: {
                            type: 'string'
                          }
                        }
                      },
                      owner: {
                        type: 'object',
                        properties: {
                          id: {
                            type: 'string'
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  })
  @ApiCreatedResponse({ description: 'A list of NFTs associated with the wallet address.', type: Object })
  @ApiForbiddenResponse({ description: 'Forbidden.' })
  getCollectiblesByOwner (@Param('address') address: string) {
    return this.graphqlAPIService.getCollectiblesByOwner(address)
  }

  @Get('userops/:address')
  @ApiOperation({ summary: 'Fetches user operations for a specific wallet address, including transactions, user operation hashes, and related activity data.' })
  @ApiParam({ name: 'apiKey', type: String, required: true })
  @ApiParam({ name: 'address', type: String, required: true })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            userOps: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string'
                  },
                  transactionHash: {
                    type: 'string'
                  },
                  sender: {
                    type: 'string'
                  },
                  entryPoint: {
                    type: 'string'
                  },
                  paymaster: {
                    type: 'string'
                  },
                  paymasterAndData: {
                    type: 'string'
                  },
                  bundler: {
                    type: 'string'
                  },
                  nonce: {
                    type: 'string'
                  },
                  initCode: {
                    type: 'string'
                  },
                  actualGasCost: {
                    type: 'string'
                  },
                  callGasLimit: {
                    type: 'string'
                  },
                  verificationGasLimit: {
                    type: 'string'
                  },
                  preVerificationGas: {
                    type: 'string'
                  },
                  maxFeePerGas: {
                    type: 'string'
                  },
                  maxPriorityFeePerGas: {
                    type: 'string'
                  },
                  baseFeePerGas: {
                    type: 'string'
                  },
                  gasPrice: {
                    type: 'string'
                  },
                  gasLimit: {
                    type: 'string'
                  },
                  signature: {
                    type: 'string'
                  },
                  success: {
                    type: 'boolean'
                  },
                  revertReason: {
                    type: 'string'
                  },
                  blockTime: {
                    type: 'string'
                  },
                  blockNumber: {
                    type: 'string'
                  },
                  network: {
                    type: 'string'
                  },
                  target: {
                    type: 'string'
                  },
                  accountTarget: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'string'
                      },
                      userOpsCount: {
                        type: 'string'
                      }
                    }
                  },
                  callData: {
                    type: 'string'
                  },
                  beneficiary: {
                    type: 'string'
                  },
                  factory: {
                    type: 'string'
                  },
                  erc721Transfers: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        from: {
                          type: 'string'
                        },
                        to: {
                          type: 'string'
                        },
                        tokenId: {
                          type: 'string'
                        },
                        contractAddress: {
                          type: 'string'
                        },
                        name: {
                          type: 'string'
                        },
                        symbol: {
                          type: 'string'
                        }
                      }
                    }
                  },
                  erc20Transfers: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        from: {
                          type: 'string'
                        },
                        to: {
                          type: 'string'
                        },
                        value: {
                          type: 'string'
                        },
                        contractAddress: {
                          type: 'string'
                        },
                        name: {
                          type: 'string'
                        },
                        symbol: {
                          type: 'string'
                        },
                        decimals: {
                          type: 'string'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  })
  @ApiCreatedResponse({ description: 'A list of user operations associated with the wallet address.', type: Object })
  @ApiForbiddenResponse({ description: 'Forbidden.' })
  getUserOpsBySender (@Param('address') address: string) {
    return this.graphqlAPIService.getUserOpsBySender(address)
  }
}
