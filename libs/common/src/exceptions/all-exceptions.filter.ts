import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger
} from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core'

  @Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor (
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly logger: Logger
  ) {}

  catch (exception: unknown, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost

    const ctx = host.switchToHttp()

    let httpStatus: HttpStatus
    let errorMessage: string | object

    if (exception instanceof HttpException) {
      httpStatus = exception.getStatus()
      errorMessage = exception.getResponse()
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

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus)
  }
}
