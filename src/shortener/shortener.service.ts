import { Injectable, Inject, Logger, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ShortCodeService } from './short-code.service';
import { ShortUrlRepository } from './short-url.repository';

@Injectable()
export class ShortenerService implements OnModuleInit {
  constructor(
    private readonly shortCode: ShortCodeService,
    private readonly repository: ShortUrlRepository,
    @Inject('SHORTENER_REDIS') private readonly client: ClientProxy,
  ) {}

  private readonly logger = new Logger(ShortenerService.name);

  async onModuleInit() {
    await this.client.connect();
    this.client.status.subscribe((status) => this.logger.log(`Redis status: ${status}`));
    (this.client as any).on('error', (_client: string, err: Error) =>
      this.logger.error(`Redis error: ${err.message}`),
    );
  }

  async shorten(url: string): Promise<string> {
    let code = this.shortCode.generate();
    while (await this.repository.findByCode(code)) {
      code = this.shortCode.generate();
    }
    await this.repository.create(url, code);
    this.client.emit('shortener.created', code);
    return code;
  }

  async getUrl(code: string): Promise<string | undefined> {
    const short = await this.repository.findByCode(code);
    if (short) {
      this.client.emit('shortener.access', code);
      return short.originalUrl;
    }
    return undefined;
  }

  // Validation is handled by class-validator
}
