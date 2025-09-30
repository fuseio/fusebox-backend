import {
  ArgumentsHost, Catch, ExceptionFilter, HttpException,
  HttpStatus,
  Logger
} from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core'
import { RpcException } from '@nestjs/microservices'
import { ServerResponse } from 'http'
import { MongoServerError } from 'mongodb'
import { throwError } from 'rxjs'
import { get, isPlainObject } from 'lodash'

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
      httpStatus = exception.getStatus() || HttpStatus.INTERNAL_SERVER_ERROR
      errorMessage = exception.getResponse()
    } else if (exception instanceof MongoServerError) {
      if (exception.code === 11000) {
        httpStatus = HttpStatus.BAD_REQUEST
        errorMessage = `${Object.keys(exception?.keyValue)} must be unique`
      }
    } else if (exception instanceof RpcException) {
      // RpcException can have custom status in the error object
      const rpcError = exception.getError()
      this.logger.debug(`RpcException caught - Raw error object: ${JSON.stringify(rpcError)}`)

      if (isPlainObject(rpcError)) {
        httpStatus = get(rpcError, 'status', get(rpcError, 'statusCode', HttpStatus.INTERNAL_SERVER_ERROR))
        errorMessage = get(rpcError, 'error', get(rpcError, 'message', exception.message))
        this.logger.debug(`RpcException - Extracted status: ${httpStatus}, message: ${errorMessage}`)
      } else {
        httpStatus = HttpStatus.INTERNAL_SERVER_ERROR
        errorMessage = exception.message
        this.logger.debug(`RpcException - Using defaults, status: ${httpStatus}, message: ${errorMessage}`)
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
      this.logger.debug(`Returning RPC error - status: ${httpStatus}, message: ${errorMessage}`)
      return throwError(() => ({
        error: errorMessage, // Use 'error' field for consistency
        status: httpStatus
      }))
    }

    response.statusCode = httpStatus

    httpAdapter.reply(response, responseBody, httpStatus)
  }
}
