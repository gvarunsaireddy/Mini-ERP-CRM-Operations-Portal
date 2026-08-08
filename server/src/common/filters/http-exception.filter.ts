import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message = exception.message;
    let error = 'Http Exception';

    if (typeof exceptionResponse === 'object') {
      message = (exceptionResponse as any).message || message;
      error = (exceptionResponse as any).error || error;
    }

    response
      .status(status)
      .json({
        statusCode: status,
        message,
        error,
        timestamp: new Date().toISOString(),
      });
  }
}
