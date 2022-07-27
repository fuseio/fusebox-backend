import {
  ArgumentsHost, Catch, ExceptionFilter, HttpException,
  HttpStatus,
  Logger
} from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core'
import { ServerResponse } from 'http'
import { MongoServerError } from 'mongodb'
import { throwError } from 'rxjs'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor (
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly logger: Logger
  ) {}

  catch (exception: any, host: ArgumentsHost): any {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost

    const ctx = host.switchToHttp()
    const response : ServerResponse = ctx.getResponse()

    let httpStatus: HttpStatus
    let errorMessage: string | object

    if (exception instanceof HttpException) {
      httpStatus = exception.getStatus()
      errorMessage = exception.getResponse()
    } else if (exception instanceof MongoServerError) {
      if (exception.code === 11000) {
        httpStatus = HttpStatus.BAD_REQUEST
        errorMessage = `${Object.keys(exception?.keyValue)} must be unique`
      }
    } else {
      httpStatus = HttpStatus.INTERNAL_SERVER_ERROR
      errorMessage = 'Critical Internal Server Error Occurred'
    }

    this.logger.error(exception)

    const responseBody = {
      statusCode: httpStatus,
      errorMessage,
      path: httpAdapter.getRequestUrl(ctx.getRequest())
    }

    if (host.getType() === 'rpc') {
      return throwError(() => ({ message: errorMessage, status: httpStatus }))
    }

    httpAdapter.reply(response, responseBody, httpStatus)
  }
}
