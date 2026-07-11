import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { AppError } from '../errors/app.error';

type ErrorResponse = {
  statusCode: number;
  message: string | string[];
};

/** Converts known application and database errors into consistent HTTP responses. */
@Catch(AppError, Prisma.PrismaClientKnownRequestError)
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(
    exception: AppError | Prisma.PrismaClientKnownRequestError,
    host: ArgumentsHost,
  ): void {
    const response = host.switchToHttp().getResponse<{
      status: (status: number) => { json: (body: ErrorResponse) => void };
    }>();
    const errorResponse = this.toAppError(exception);

    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private toAppError(
    exception: AppError | Prisma.PrismaClientKnownRequestError,
  ): ErrorResponse {
    if (exception instanceof AppError) {
      return {
        statusCode: exception.statusCode,
        message: exception.message,
      };
    }

    if (exception.code === 'P2002') {
      return {
        statusCode: HttpStatus.CONFLICT,
        message: 'A record with the same value already exists',
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    };
  }
}
