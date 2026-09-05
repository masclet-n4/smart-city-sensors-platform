import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApplicationError } from '../errors/application.error.js';

const statusByCode = {
  UNAUTHORIZED: HttpStatus.UNAUTHORIZED,
  NOT_FOUND: HttpStatus.NOT_FOUND,
  CONFLICT: HttpStatus.CONFLICT,
  BAD_REQUEST: HttpStatus.BAD_REQUEST,
  UPSTREAM_ERROR: HttpStatus.BAD_GATEWAY,
  UPSTREAM_TIMEOUT: HttpStatus.GATEWAY_TIMEOUT,
  INTERNAL_ERROR: HttpStatus.INTERNAL_SERVER_ERROR,
} as const;


@Catch(ApplicationError)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(error: ApplicationError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const statusCode = statusByCode[error.code];

    response.status(statusCode).json({
      statusCode,
      message: error.message,
    });
  }
}
