import { Test, TestingModule } from '@nestjs/testing'
import { SmartWalletsLegacyService } from './smart-wallets-legacy.service'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import RelayAPIService from '@app/smart-wallets-service/common/services/relay-api.service'
import { CentClient } from 'cent.js'
import { smartWalletString } from '@app/smart-wallets-service/smart-wallets/smart-wallets.constants'
import { RpcException } from '@nestjs/microservices'
import { HttpStatus } from '@nestjs/common'
import * as helperFunctions from '@app/smart-wallets-service/common/utils/helper-functions'

describe('SmartWalletsLegacyService - relay', () => {
    let service: SmartWalletsLegacyService
    let centClient: jest.Mocked<CentClient>
    let relayAPIService: jest.Mocked<RelayAPIService>
    let configService: jest.Mocked<ConfigService>

    const mockRelayDto: any = {
        ownerAddress: '0x1234567890123456789012345678901234567890',
        walletAddress: '0x0987654321098765432109876543210987654321',
        data: '0xabcdef',
        nonce: '1',
        methodName: 'execute',
        signature: '0x1234',
        walletModule: '0xmoduleaddress'
    }

    const mockTransactionId = 'test-transaction-id-123'
    const mockWsUrl = 'wss://ws.test.io/connection/websocket'

    beforeEach(async () => {
        centClient = {
            subscribe: jest.fn().mockResolvedValue(undefined),
            unsubscribe: jest.fn().mockResolvedValue(undefined),
            publish: jest.fn().mockResolvedValue(undefined)
        } as any

        relayAPIService = {
            relay: jest.fn().mockResolvedValue(undefined),
            createWallet: jest.fn().mockResolvedValue(undefined)
        } as any

        configService = {
            get: jest.fn((key: string) => {
                if (key === 'wsUrl') return mockWsUrl
                if (key === 'sharedAddresses') return {}
                return null
            })
        } as any

        const mockModel = {
            findOne: jest.fn(),
            create: jest.fn(),
            findOneAndUpdate: jest.fn()
        }

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SmartWalletsLegacyService,
                {
                    provide: JwtService,
                    useValue: { sign: jest.fn() }
                },
                {
                    provide: ConfigService,
                    useValue: configService
                },
                {
                    provide: RelayAPIService,
                    useValue: relayAPIService
                },
                {
                    provide: CentClient,
                    useValue: centClient
                },
                {
                    provide: smartWalletString,
                    useValue: mockModel
                }
            ]
        }).compile()

        service = module.get<SmartWalletsLegacyService>(SmartWalletsLegacyService)
        jest.spyOn(helperFunctions, 'generateTransactionId').mockReturnValue(mockTransactionId)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('Happy Path', () => {
        it('should successfully relay transaction with immediate response', async () => {
            const result = await service.relay(mockRelayDto)

            expect(result).toEqual({
                connectionUrl: mockWsUrl,
                transactionId: mockTransactionId
            })
            expect(helperFunctions.generateTransactionId).toHaveBeenCalledWith(mockRelayDto.data)
        })

        it('should call centClient.subscribe with correct parameters', async () => {
            await service.relay(mockRelayDto)
            await new Promise(resolve => setTimeout(resolve, 10))

            expect(centClient.subscribe).toHaveBeenCalledWith({
                channel: `transaction:#${mockTransactionId}`,
                user: mockRelayDto.ownerAddress
            })
        })

        it('should call relayAPIService.relay with correct parameters', async () => {
            await service.relay(mockRelayDto)
            await new Promise(resolve => setTimeout(resolve, 10))

            expect(relayAPIService.relay).toHaveBeenCalledWith({
                v2: true,
                transactionId: mockTransactionId,
                ...mockRelayDto
            })
        })

        it('should return immediately without waiting for centClient or relayAPI', async () => {
            centClient.subscribe.mockImplementation(() =>
                new Promise(resolve => setTimeout(resolve, 1000))
            )
            relayAPIService.relay.mockImplementation(() =>
                new Promise(resolve => setTimeout(resolve, 1000))
            )

            const startTime = Date.now()
            const result = await service.relay(mockRelayDto)
            const duration = Date.now() - startTime

            expect(duration).toBeLessThan(100)
            expect(result.transactionId).toBe(mockTransactionId)
        })
    })

    describe('Resilience - Centrifugo Failures', () => {
        it('should still return success when centClient.subscribe fails', async () => {
            centClient.subscribe.mockRejectedValue(new Error('Centrifugo is down'))

            const result = await service.relay(mockRelayDto)

            expect(result).toEqual({
                connectionUrl: mockWsUrl,
                transactionId: mockTransactionId
            })
        })

        it('should log error when centClient.subscribe fails', async () => {
            const loggerErrorSpy = jest.spyOn(service['logger'], 'error')
            centClient.subscribe.mockRejectedValue(new Error('Connection timeout'))

            await service.relay(mockRelayDto)
            await new Promise(resolve => setTimeout(resolve, 10))

            expect(loggerErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('Centrifugo subscription failed')
            )
        })

        it('should throw RpcException when centClient throws synchronous error', async () => {
            centClient.subscribe.mockImplementation(() => {
                throw new Error('Immediate failure')
            })

            await expect(service.relay(mockRelayDto)).rejects.toThrow(RpcException)
        })
    })

    describe('Resilience - Relay API Failures', () => {
        it('should still return success when relayAPIService.relay fails', async () => {
            relayAPIService.relay.mockRejectedValue(new Error('Relay API is down'))

            const result = await service.relay(mockRelayDto)

            expect(result).toEqual({
                connectionUrl: mockWsUrl,
                transactionId: mockTransactionId
            })
        })

        it('should log error when relayAPIService.relay fails', async () => {
            const loggerErrorSpy = jest.spyOn(service['logger'], 'error')
            relayAPIService.relay.mockRejectedValue(new Error('500 Internal Server Error'))

            await service.relay(mockRelayDto)
            await new Promise(resolve => setTimeout(resolve, 10))

            expect(loggerErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('Relay API call failed')
            )
        })

        it('should handle 5xx errors from relay API gracefully', async () => {
            relayAPIService.relay.mockRejectedValue({
                response: { status: 503, data: 'Service Unavailable' }
            })

            const result = await service.relay(mockRelayDto)

            expect(result.transactionId).toBe(mockTransactionId)
        })
    })

    describe('Resilience - Multiple Failures', () => {
        it('should still return success when both centClient and relayAPI fail', async () => {
            centClient.subscribe.mockRejectedValue(new Error('Centrifugo down'))
            relayAPIService.relay.mockRejectedValue(new Error('Relay API down'))

            const result = await service.relay(mockRelayDto)

            expect(result).toEqual({
                connectionUrl: mockWsUrl,
                transactionId: mockTransactionId
            })
        })

        it('should log both errors when both services fail', async () => {
            const loggerErrorSpy = jest.spyOn(service['logger'], 'error')
            centClient.subscribe.mockRejectedValue(new Error('Centrifugo error'))
            relayAPIService.relay.mockRejectedValue(new Error('Relay error'))

            await service.relay(mockRelayDto)
            await new Promise(resolve => setTimeout(resolve, 10))

            expect(loggerErrorSpy).toHaveBeenCalledTimes(2)
            expect(loggerErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('Centrifugo subscription failed')
            )
            expect(loggerErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('Relay API call failed')
            )
        })
    })

    describe('Error Handling - Critical Failures', () => {
        it('should throw RpcException when generateTransactionId fails', async () => {
            jest.spyOn(helperFunctions, 'generateTransactionId').mockImplementation(() => {
                throw new Error('Invalid data format')
            })

            await expect(service.relay(mockRelayDto)).rejects.toThrow(RpcException)
        })

        it('should throw RpcException with correct status and message', async () => {
            jest.spyOn(helperFunctions, 'generateTransactionId').mockImplementation(() => {
                throw new Error('Transaction ID generation failed')
            })

            try {
                await service.relay(mockRelayDto)
                fail('Should have thrown RpcException')
            } catch (error) {
                expect(error).toBeInstanceOf(RpcException)
                expect(error.getError()).toEqual({
                    error: 'Transaction ID generation failed',
                    status: HttpStatus.BAD_REQUEST
                })
            }
        })

        it('should log error when critical failure occurs', async () => {
            const loggerErrorSpy = jest.spyOn(service['logger'], 'error')
            jest.spyOn(helperFunctions, 'generateTransactionId').mockImplementation(() => {
                throw new Error('Critical error')
            })

            try {
                await service.relay(mockRelayDto)
            } catch (error) {
                // Expected
            }

            expect(loggerErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('An error occurred during relay execution')
            )
        })
    })

    describe('Transaction ID Generation', () => {
        it('should generate transaction ID from relay data', async () => {
            await service.relay(mockRelayDto)

            expect(helperFunctions.generateTransactionId).toHaveBeenCalledWith(mockRelayDto.data)
        })

        it('should use generated transaction ID in centClient subscription', async () => {
            const customTransactionId = 'custom-tx-id-456'
            jest.spyOn(helperFunctions, 'generateTransactionId').mockReturnValue(customTransactionId)

            await service.relay(mockRelayDto)
            await new Promise(resolve => setTimeout(resolve, 10))

            expect(centClient.subscribe).toHaveBeenCalledWith({
                channel: `transaction:#${customTransactionId}`,
                user: mockRelayDto.ownerAddress
            })
        })

        it('should use generated transaction ID in relay API call', async () => {
            const customTransactionId = 'custom-tx-id-789'
            jest.spyOn(helperFunctions, 'generateTransactionId').mockReturnValue(customTransactionId)

            await service.relay(mockRelayDto)
            await new Promise(resolve => setTimeout(resolve, 10))

            expect(relayAPIService.relay).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionId: customTransactionId
                })
            )
        })

        it('should return generated transaction ID to client', async () => {
            const customTransactionId = 'custom-tx-id-abc'
            jest.spyOn(helperFunctions, 'generateTransactionId').mockReturnValue(customTransactionId)

            const result = await service.relay(mockRelayDto)

            expect(result.transactionId).toBe(customTransactionId)
        })
    })

    describe('Connection URL', () => {
        it('should return correct WebSocket URL from config', async () => {
            const result = await service.relay(mockRelayDto)

            expect(result.connectionUrl).toBe(mockWsUrl)
            expect(configService.get).toHaveBeenCalledWith('wsUrl')
        })

        it('should handle different WebSocket URLs', async () => {
            const customWsUrl = 'wss://custom.fuse.io/ws'
            configService.get.mockReturnValue(customWsUrl)

            const result = await service.relay(mockRelayDto)

            expect(result.connectionUrl).toBe(customWsUrl)
        })
    })

    describe('Fire-and-Forget Behavior', () => {
        it('should not block on slow centClient operations', async () => {
            let subscribeResolved = false
            centClient.subscribe.mockImplementation(() =>
                new Promise(resolve => {
                    setTimeout(() => {
                        subscribeResolved = true
                        resolve(undefined)
                    }, 2000)
                })
            )

            const result = await service.relay(mockRelayDto)

            expect(result).toBeDefined()
            expect(subscribeResolved).toBe(false)
        })

        it('should not block on slow relay API operations', async () => {
            let relayResolved = false
            relayAPIService.relay.mockImplementation(() =>
                new Promise(resolve => {
                    setTimeout(() => {
                        relayResolved = true
                        resolve(undefined)
                    }, 2000)
                })
            )

            const result = await service.relay(mockRelayDto)

            expect(result).toBeDefined()
            expect(relayResolved).toBe(false)
        })
    })

    describe('Data Integrity', () => {
        it('should pass all relay DTO fields to relay API', async () => {
            const fullRelayDto = {
                ...mockRelayDto,
                gasPrice: 20000000000,
                gasLimit: 21000
            }

            await service.relay(fullRelayDto)
            await new Promise(resolve => setTimeout(resolve, 10))

            expect(relayAPIService.relay).toHaveBeenCalledWith(
                expect.objectContaining({
                    ownerAddress: fullRelayDto.ownerAddress,
                    data: fullRelayDto.data,
                    walletAddress: fullRelayDto.walletAddress,
                    nonce: fullRelayDto.nonce,
                    gasPrice: fullRelayDto.gasPrice,
                    gasLimit: fullRelayDto.gasLimit,
                    methodName: fullRelayDto.methodName,
                    signature: fullRelayDto.signature,
                    walletModule: fullRelayDto.walletModule
                })
            )
        })

        it('should include v2 flag in relay API call', async () => {
            await service.relay(mockRelayDto)
            await new Promise(resolve => setTimeout(resolve, 10))

            expect(relayAPIService.relay).toHaveBeenCalledWith(
                expect.objectContaining({
                    v2: true
                })
            )
        })
    })

    describe('Production - Config Validation', () => {
        it('should throw error when wsUrl is null', async () => {
            configService.get.mockReturnValue(null)

            await expect(service.relay(mockRelayDto)).rejects.toThrow()
        })

        it('should throw error when wsUrl is undefined', async () => {
            configService.get.mockReturnValue(undefined)

            await expect(service.relay(mockRelayDto)).rejects.toThrow()
        })

        it('should throw error when wsUrl is empty string', async () => {
            configService.get.mockReturnValue('')

            await expect(service.relay(mockRelayDto)).rejects.toThrow(RpcException)
        })
    })

    describe('Production - Invalid Input', () => {
        it('should handle null relayDto.data gracefully', async () => {
            const invalidDto = { ...mockRelayDto, data: null }

            const result = await service.relay(invalidDto)

            expect(result).toBeDefined()
            expect(result.connectionUrl).toBe(mockWsUrl)
        })

        it('should handle undefined relayDto.ownerAddress', async () => {
            const invalidDto = { ...mockRelayDto, ownerAddress: undefined }

            const result = await service.relay(invalidDto)

            expect(result).toBeDefined()
        })

        it('should handle empty string data', async () => {
            const invalidDto = { ...mockRelayDto, data: '' }

            const result = await service.relay(invalidDto)

            expect(result.transactionId).toBe(mockTransactionId)
        })

        it('should handle very large data payload', async () => {
            const largeData = '0x' + 'a'.repeat(100000)
            const largeDto = { ...mockRelayDto, data: largeData }

            const result = await service.relay(largeDto)

            expect(result.transactionId).toBe(mockTransactionId)
        })
    })

    describe('Production - Transaction ID Edge Cases', () => {
        it('should handle null transaction ID', async () => {
            jest.spyOn(helperFunctions, 'generateTransactionId').mockReturnValue(null as any)

            const result = await service.relay(mockRelayDto)

            expect(result.transactionId).toBeNull()
        })

        it('should handle empty string transaction ID', async () => {
            jest.spyOn(helperFunctions, 'generateTransactionId').mockReturnValue('')

            const result = await service.relay(mockRelayDto)

            expect(result.transactionId).toBe('')
            expect(result.connectionUrl).toBe(mockWsUrl)
        })

        it('should handle special characters in transaction ID', async () => {
            const specialTxId = 'tx:@#$%^&*()123'
            jest.spyOn(helperFunctions, 'generateTransactionId').mockReturnValue(specialTxId)

            await service.relay(mockRelayDto)
            await new Promise(resolve => setTimeout(resolve, 10))

            expect(centClient.subscribe).toHaveBeenCalledWith({
                channel: `transaction:#${specialTxId}`,
                user: mockRelayDto.ownerAddress
            })
        })

        it('should handle very long transaction ID', async () => {
            const longTxId = 'a'.repeat(1000)
            jest.spyOn(helperFunctions, 'generateTransactionId').mockReturnValue(longTxId)

            const result = await service.relay(mockRelayDto)

            expect(result.transactionId).toBe(longTxId)
        })
    })

    describe('Production - Promise Behavior', () => {
        it('should handle centClient not returning a promise', async () => {
            centClient.subscribe = jest.fn() as any

            const result = await service.relay(mockRelayDto)

            expect(result.transactionId).toBe(mockTransactionId)
        })

        it('should handle relayAPI not returning a promise', async () => {
            relayAPIService.relay = jest.fn() as any

            const result = await service.relay(mockRelayDto)

            expect(result.transactionId).toBe(mockTransactionId)
        })

        it('should handle promises that never resolve', async () => {
            centClient.subscribe.mockImplementation(() =>
                new Promise(() => { }) // Never resolves
            )

            const startTime = Date.now()
            const result = await service.relay(mockRelayDto)
            const duration = Date.now() - startTime

            expect(duration).toBeLessThan(100)
            expect(result.transactionId).toBe(mockTransactionId)
        })

        it('should handle error without message property', async () => {
            const loggerErrorSpy = jest.spyOn(service['logger'], 'error')
            centClient.subscribe.mockRejectedValue({ code: 500 } as any)

            await service.relay(mockRelayDto)
            await new Promise(resolve => setTimeout(resolve, 10))

            expect(loggerErrorSpy).toHaveBeenCalled()
        })

        it('should handle circular reference in error', async () => {
            const loggerErrorSpy = jest.spyOn(service['logger'], 'error')
            const circularError: any = { message: 'Circular' }
            circularError.self = circularError

            centClient.subscribe.mockRejectedValue(circularError)

            await service.relay(mockRelayDto)
            await new Promise(resolve => setTimeout(resolve, 10))

            expect(loggerErrorSpy).toHaveBeenCalled()
        })
    })

    describe('Production - Concurrent Calls', () => {
        it('should handle multiple concurrent relay calls', async () => {
            const promises = Array.from({ length: 10 }, (_, i) =>
                service.relay({
                    ...mockRelayDto,
                    data: `0xdata${i}`
                })
            )

            const results = await Promise.all(promises)

            expect(results).toHaveLength(10)
            results.forEach(result => {
                expect(result.transactionId).toBe(mockTransactionId)
                expect(result.connectionUrl).toBe(mockWsUrl)
            })
        })

        it('should handle concurrent calls with mixed success/failure', async () => {
            let callCount = 0
            centClient.subscribe.mockImplementation(() => {
                callCount++
                if (callCount % 2 === 0) {
                    return Promise.reject(new Error('Even call failed'))
                }
                return Promise.resolve(undefined)
            })

            const promises = Array.from({ length: 10 }, () =>
                service.relay(mockRelayDto)
            )

            const results = await Promise.all(promises)

            expect(results).toHaveLength(10)
            results.forEach(result => {
                expect(result.transactionId).toBe(mockTransactionId)
            })
        })
    })

    describe('Production - Memory Leak Prevention', () => {
        it('should not leak memory with many failed promises', async () => {
            centClient.subscribe.mockRejectedValue(new Error('Always fails'))
            relayAPIService.relay.mockRejectedValue(new Error('Always fails'))

            const promises = Array.from({ length: 100 }, () =>
                service.relay(mockRelayDto)
            )

            const results = await Promise.all(promises)

            expect(results).toHaveLength(100)
        })

        it('should handle rapid fire-and-forget without blocking', async () => {
            const startTime = Date.now()

            const promises = Array.from({ length: 50 }, () =>
                service.relay(mockRelayDto)
            )

            await Promise.all(promises)

            const duration = Date.now() - startTime

            expect(duration).toBeLessThan(500)
        })
    })

    describe('Production - Error Message Edge Cases', () => {
        it('should handle error with undefined message', async () => {
            jest.spyOn(helperFunctions, 'generateTransactionId').mockImplementation(() => {
                const err: any = new Error()
                delete err.message
                throw err
            })

            try {
                await service.relay(mockRelayDto)
                fail('Should have thrown')
            } catch (error) {
                expect(error).toBeInstanceOf(RpcException)
                expect(error.getError().error).toBe('Relay execution error')
            }
        })
    })

    describe('Production - Service Integration', () => {
        it('should pass exact relay DTO to relay API without modification', async () => {
            const complexDto = {
                ...mockRelayDto,
                customField: 'should be passed',
                nestedObject: { a: 1, b: 2 }
            }

            await service.relay(complexDto)
            await new Promise(resolve => setTimeout(resolve, 10))

            expect(relayAPIService.relay).toHaveBeenCalledWith(
                expect.objectContaining({
                    v2: true,
                    transactionId: mockTransactionId,
                    customField: 'should be passed',
                    nestedObject: { a: 1, b: 2 }
                })
            )
        })

        it('should override v2 flag even if relayDto has v2: false', async () => {
            const dtoWithV2False = { ...mockRelayDto, v2: false }

            await service.relay(dtoWithV2False)
            await new Promise(resolve => setTimeout(resolve, 10))

            expect(relayAPIService.relay).toHaveBeenCalledWith(
                expect.objectContaining({
                    v2: true
                })
            )
        })
    })

    describe('Production - State Consistency', () => {
        it('should maintain consistent state across multiple calls', async () => {
            const call1 = await service.relay(mockRelayDto)
            const call2 = await service.relay(mockRelayDto)
            const call3 = await service.relay(mockRelayDto)

            expect(call1.connectionUrl).toBe(call2.connectionUrl)
            expect(call2.connectionUrl).toBe(call3.connectionUrl)
        })

        it('should not mutate input relayDto', async () => {
            const dtoSnapshot = JSON.parse(JSON.stringify(mockRelayDto))

            await service.relay(mockRelayDto)

            expect(mockRelayDto).toEqual(dtoSnapshot)
        })
    })
})
