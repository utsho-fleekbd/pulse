import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';

import type { Request, Response } from 'express';

import type { ApiErrorResponse } from '../interfaces/api-error.interface.js';

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every((item: unknown) => typeof item === 'string')
  );
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter<HttpException> {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const context = host.switchToHttp();

    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    const statusCode = exception.getStatus();

    const payload: ApiErrorResponse = {
      statusCode,
      message: this.getMessage(exception),
      path: request.originalUrl,
      timestamp: new Date().toISOString(),
    };

    response.status(statusCode).json(payload);
  }

  private getMessage(exception: HttpException): string | string[] {
    const result: unknown = exception.getResponse();

    if (typeof result === 'string') {
      return result;
    }

    if (typeof result === 'object' && result !== null && 'message' in result) {
      const message = result.message;

      if (typeof message === 'string') {
        return message;
      }

      if (isStringArray(message)) {
        return message;
      }
    }

    return exception.message;
  }
}
