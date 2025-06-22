import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    @InjectPinoLogger(AllExceptionsFilter.name)
    private readonly logger: PinoLogger,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const baseLog = {
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      method: request.method,
      url: request.url,
    };

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const message = exception.getResponse();
      this.logger.error(
        { ...baseLog, status },
        exception instanceof Error ? exception.stack : undefined,
      );
      response.status(status).json(message);
    } else {
      this.logger.error(
        { ...baseLog, status: 500 },
        exception instanceof Error ? exception.stack : undefined,
      );
      response
        .status(500)
        .json({ statusCode: 500, message: 'Internal server error' });
    }
  }
}
