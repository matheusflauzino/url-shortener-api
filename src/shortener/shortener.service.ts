import { Injectable, BadRequestException } from '@nestjs/common';
import { ShortCodeService } from './short-code.service';
import { ShortUrlRepository } from './short-url.repository';
import { CacheService } from '../common/cache.service';

@Injectable()
export class ShortenerService {
  constructor(
    private readonly shortCode: ShortCodeService,
    private readonly repository: ShortUrlRepository,
    private readonly cache: CacheService,
  ) {}

  async shorten(url: string, userId: number): Promise<string> {
    this.validateUrl(url);
    let code = this.shortCode.generate();
    while (await this.repository.findByCode(code)) {
      code = this.shortCode.generate();
    }
    await this.repository.create(url, code, userId);
    await this.cache.set(code, url);
    return code;
  }

  async getUrl(code: string): Promise<string | undefined> {
    const cached = await this.cache.get(code);
    if (cached) {
      await this.repository.incrementAccess(code);
      return cached;
    }
    const short = await this.repository.findByCode(code);
    if (short) {
      await this.repository.incrementAccess(code);
      await this.cache.set(code, short.originalUrl);
      return short.originalUrl;
    }
    return undefined;
  }

  private validateUrl(url: string): void {
    try {
      // eslint-disable-next-line no-new
      new URL(url);
    } catch {
      throw new BadRequestException('Invalid URL');
    }
  }
}
