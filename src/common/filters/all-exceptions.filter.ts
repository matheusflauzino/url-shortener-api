import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const message = exception.getResponse();
      this.logger.error(`${request.method} ${request.url} ${status}`, exception instanceof Error ? exception.stack : undefined);
      response.status(status).json(message);
    } else {
      this.logger.error(`${request.method} ${request.url} 500`, exception instanceof Error ? exception.stack : undefined);
      response.status(500).json({ statusCode: 500, message: 'Internal server error' });
    }
  }
}
