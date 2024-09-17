import { HttpException, HttpStatus } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { lastValueFrom, takeLast, catchError, throwError, timeout, TimeoutError } from 'rxjs'

export async function callMSFunction (client: ClientProxy, pattern: string, data: any) {
  const serviceName = (client as any).host || 'UnknownService'
  return lastValueFrom(
    client
      .send(pattern, data)
      .pipe(
        timeout(15000),
        takeLast(1),
        catchError((error) => {
          console.error(`Error in microservice call to ${serviceName} (pattern: ${pattern}):`, error)
          if (error instanceof TimeoutError) {
            return throwError(() => new HttpException(`Timeout in ${serviceName} microservice call`, HttpStatus.REQUEST_TIMEOUT))
          }
          return throwError(() => new HttpException(
            `Error in ${serviceName} microservice: ${error.message || 'Unknown error'}`,
            error.status || HttpStatus.INTERNAL_SERVER_ERROR
          ))
        })
      )
  )
}
