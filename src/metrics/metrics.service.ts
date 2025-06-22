import { Injectable } from '@nestjs/common';
import { collectDefaultMetrics, Counter, Registry } from 'prom-client';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class MetricsService {
  private readonly registry: Registry = new Registry();
  private readonly counter: Counter<string>;

  constructor() {
    collectDefaultMetrics({ register: this.registry });
    this.counter = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'status'],
      registers: [this.registry],
    });
  }

  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      res.on('finish', () => {
        this.counter.labels(req.method, String(res.statusCode)).inc();
      });
      next();
    };
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  getContentType(): string {
    return this.registry.contentType;
  }
}
