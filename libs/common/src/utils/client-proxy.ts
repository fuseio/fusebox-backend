import { HttpException, HttpStatus } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { lastValueFrom, takeLast, catchError, throwError, timeout, TimeoutError } from 'rxjs'
import { get } from 'lodash'

export async function callMSFunction (client: ClientProxy, pattern: string, data: any) {
  const serviceName = (client as any).host || 'UnknownService'
  return lastValueFrom(
    client
      .send(pattern, data)
      .pipe(
        timeout(20000),
        takeLast(1),
        catchError((error) => {
          console.error(`Error in microservice call to ${serviceName} (pattern: ${pattern}):`, error)
          console.debug('Raw error object structure:', {
            status: get(error, 'status'),
            statusCode: get(error, 'statusCode'),
            error: get(error, 'error'),
            message: get(error, 'message'),
            fullError: JSON.stringify(error)
          })

          if (error instanceof TimeoutError) {
            return throwError(() => new HttpException(`Timeout in ${serviceName} microservice call`, HttpStatus.REQUEST_TIMEOUT))
          }

          // Handle RpcException errors - they use 'error' and 'status' fields
          // Also support legacy 'message' and 'statusCode' fields for backward compatibility
          const statusCode = get(error, 'status', get(error, 'statusCode', HttpStatus.INTERNAL_SERVER_ERROR))
          const message = get(error, 'error', get(error, 'message', 'Unknown error'))

          console.debug(`Extracted from error - statusCode: ${statusCode}, message: ${message}`)

          return throwError(() => new HttpException(
            `Error in ${serviceName} microservice: ${message}`,
            statusCode
          ))
        })
      )
  )
}
