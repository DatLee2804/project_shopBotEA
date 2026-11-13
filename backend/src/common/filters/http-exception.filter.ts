import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message = exception.message;
    let errorCode = 'UNKNOWN_ERROR';

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const resp = exceptionResponse as Record<string, unknown>;
      if (resp.errorCode) {
        errorCode = resp.errorCode as string;
      }
      if (resp.message) {
        message = Array.isArray(resp.message)
          ? resp.message.join(', ')
          : (resp.message as string);
      }
    }

    response.status(status).json({
      success: false,
      errorCode,
      message,
    });
  }
}
