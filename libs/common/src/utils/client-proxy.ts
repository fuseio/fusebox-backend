import { HttpException, HttpStatus } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { lastValueFrom, takeLast, catchError, throwError } from 'rxjs'

export async function callMSFunction (client: ClientProxy, pattern: string, data: any) {
  return lastValueFrom(
    client
      .send(pattern, data)
      .pipe(takeLast(1))
      .pipe(
        catchError((error) => {
          console.error('Error in microservice call:', error)
          return throwError(() => new HttpException(error.message || 'Unknown error', error.status || HttpStatus.INTERNAL_SERVER_ERROR))
        })
      )
  )
}
