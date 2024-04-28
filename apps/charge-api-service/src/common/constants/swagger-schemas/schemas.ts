const SWAGGER_SCHEMA_DEFINITIONS = {
  schemas: {
    StakingOptionsResponse: {
      type: 'array',
      items: {
        $ref: '#/components/schemas/StakingOption'
      }
    },
    StakingOption: {
      type: 'object',
      properties: {
        tokenAddress: {
          type: 'string'
        },
        tokenSymbol: {
          type: 'string'
        },
        tokenName: {
          type: 'string'
        },
        tokenLogoURI: {
          type: 'string'
        },
        unStakeTokenAddress: {
          type: 'string'
        },
        stakingProviderId: {
          type: 'string'
        },
        expired: {
          type: 'boolean'
        },
        stakingApr: {
          type: 'number'
        },
        tvl: {
          type: 'number'
        }
      }
    },
    StakeRequest: {
      type: 'object',
      properties: {
        accountAddress: {
          type: 'string'
        },
        tokenAmount: {
          type: 'string'
        },
        tokenAddress: {
          type: 'string'
        }
      }
    },
    StakeResponse: {
      type: 'object',
      properties: {
        contractAddress: {
          type: 'string'
        },
        encodedABI: {
          type: 'string'
        }
      }
    },
    UnstakeRequest: {
      $ref: '#/components/schemas/StakeRequest'
    },
    UnstakeResponse: {
      $ref: '#/components/schemas/StakeResponse'
    },
    StakedTokensResponse: {
      type: 'object',
      properties: {
        totalStakedAmountUSD: {
          type: 'number'
        },
        totalEarnedAmountUSD: {
          type: 'number'
        },
        stakedTokens: {
          type: 'array',
          items: {
            $ref: '#/components/schemas/StakingOption'
          }
        }
      }
    },
    WebhookCreateRequest: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string'
        },
        webhookUrl: {
          type: 'string'
        },
        eventType: {
          type: 'string'
        }
      }
    },
    WebhookUpdateRequest: {
      type: 'object',
      properties: {
        webhookId: {
          type: 'string'
        },
        webhookUrl: {
          type: 'string'
        },
        eventType: {
          type: 'string'
        }
      }
    },
    WebhookAddAddressesRequest: {
      type: 'object',
      properties: {
        webhookId: {
          type: 'string'
        },
        addresses: {
          type: 'array',
          items: {
            type: 'string'
          }
        }
      }
    },
    WebhookDeleteAddressesRequest: {
      type: 'object',
      properties: {
        webhookId: {
          type: 'string'
        },
        addresses: {
          type: 'array',
          items: {
            type: 'string'
          }
        }
      }
    },
    NFTsResponse: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            account: {
              type: 'object',
              properties: {
                id: {
                  type: 'string'
                },
                address: {
                  type: 'string'
                },
                collectibles: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Collectible'
                  }
                }
              }
            }
          }
        }
      }
    },
    Collectible: {
      type: 'object',
      properties: {
        id: {
          type: 'string'
        },
        created: {
          type: 'string'
        },
        tokenId: {
          type: 'string'
        },
        description: {
          type: 'string'
        },
        descriptorUri: {
          type: 'string'
        },
        name: {
          type: 'string'
        },
        imageURL: {
          type: 'string'
        },
        creator: {
          $ref: '#/components/schemas/Account'
        },
        owner: {
          $ref: '#/components/schemas/Account'
        },
        collection: {
          type: 'object',
          properties: {
            collectionName: {
              type: 'string'
            },
            collectionSymbol: {
              type: 'string'
            },
            collectionAddress: {
              type: 'string'
            }
          }
        }
      }
    },
    UserOpsResponse: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            userOps: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/UserOp'
              }
            }
          }
        }
      }
    },
    UserOp: {
      type: 'object',
      properties: {
        id: {
          type: 'string'
        },
        transactionHash: {
          type: 'string'
        },
        userOpHash: {
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
        actualGasUsed: {
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
    },
    Account: {
      type: 'object',
      properties: {
        id: {
          type: 'string'
        }
      }
    },
    CollectiblesResponse: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            account: {
              type: 'object',
              properties: {
                address: {
                  type: 'string'
                },
                id: {
                  type: 'string'
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
                            type: 'string'
                          },
                          collectionSymbol: {
                            type: 'string'
                          },
                          collectionAddress: {
                            type: 'string'
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
                        type: 'string'
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
    },
    ErrorResponse: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'integer'
        },
        errorMessage: {
          type: 'string'
        },
        path: {
          type: 'string'
        }
      }
    },
    AuthRequest: {
      type: 'object',
      properties: {
        hash: {
          type: 'string'
        },
        signature: {
          type: 'string'
        },
        ownerAddress: {
          type: 'string'
        },
        smartWalletAddress: {
          type: 'string'
        }
      }
    },
    ActionResponseItems: {
      type: 'object',
      properties: {
        docs: {
          type: 'array',
          items: {
            $ref: '#/components/schemas/ActionResponseItem'
          }
        }
      }
    },
    ActionResponseItem: {
      type: 'object',
      properties: {
        _id: {
          type: 'string'
        },
        walletAddress: {
          type: 'string'
        },
        name: {
          type: 'string'
        },
        status: {
          type: 'string'
        },
        received: {
          type: 'array',
          items: {
            $ref: '#/components/schemas/TokenTransaction'
          }
        },
        sent: {
          type: 'array',
          items: {
            $ref: '#/components/schemas/TokenTransaction'
          }
        },
        userOpHash: {
          type: 'string'
        },
        txHash: {
          type: 'string'
        }
      }
    },
    TokenTransaction: {
      type: 'object',
      properties: {
        name: {
          type: 'string'
        },
        symbol: {
          type: 'string'
        },
        address: {
          type: 'string'
        },
        decimals: {
          type: 'integer'
        },
        value: {
          type: 'string'
        },
        type: {
          type: 'string'
        },
        _id: {
          type: 'string'
        },
        to: {
          type: 'string',
          nullable: true
        }
      }
    }
  }
}

export default SWAGGER_SCHEMA_DEFINITIONS
