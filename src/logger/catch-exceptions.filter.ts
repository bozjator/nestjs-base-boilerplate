import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { FastifyRequest } from 'fastify';
import { AppLoggerService } from './app-logger.service';
import { LoggerInfoObject } from './models/logger-info-object.model';
import { ExceptionResponseBody } from './models/exception-response-body.model';

/**
 * Exceptions filter which will catch all exceptions, then create log object and
 * pass it to the app logger to log it.
 */
@Catch()
export class CatchExceptions implements ExceptionFilter {
  constructor(private readonly logger: AppLoggerService) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request: FastifyRequest = ctx.getRequest();
    const response: FastifyReply = ctx.getResponse();

    let httpStatus: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let responseBody: ExceptionResponseBody | any = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal Server Error',
    };

    if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
      responseBody = exception.getResponse();
    }

    // Do not log 404, because there is too many of them,
    // because of crawlers trying to access random stuff.
    if (httpStatus !== HttpStatus.NOT_FOUND)
      this.logger.error(
        new LoggerInfoObject({
          context: CatchExceptions.name,
          info: `Exception ${httpStatus}. ${exception.message}`,
          errorStack: exception.stack,
          request: {
            ip: request?.ip,
            url: request?.url,
            method: request?.method,
            headers: request?.headers,
            body: request?.body,
          },
          response: responseBody,
        }),
      );

    response.status(httpStatus).send(responseBody);
  }
}
