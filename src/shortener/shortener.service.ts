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
  ) {
    const ttlEnv = process.env.URL_TTL_DAYS;
    if (ttlEnv !== undefined) {
      const parsed = parseInt(ttlEnv, 10);
      this.ttlDays =
        Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
    }
  }

  private readonly ttlDays?: number;

  async shorten(url: string): Promise<string> {
    this.validateUrl(url);
    let code = this.shortCode.generate();
    while (await this.repository.findByCode(code)) {
      code = this.shortCode.generate();
    }
    const expiresAt =
      this.ttlDays !== undefined
        ? new Date(
            Date.now() +
              (this.ttlDays > 0
                ? this.ttlDays * 24 * 60 * 60 * 1000
                : -60 * 1000),
          )
        : undefined;
    await this.repository.create(url, code, expiresAt);
    if (expiresAt) {
      const ttlSeconds = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
      if (ttlSeconds > 0) {
        await this.cache.set(code, url, ttlSeconds);
      }
    } else {
      await this.cache.set(code, url);
    }
    return code;
  }

  async getUrl(code: string): Promise<string | undefined> {
    const cached = await this.cache.get(code);
    if (cached) {
      await this.repository.incrementAccess(code);
      return cached;
    }
    const short = await this.repository.findByCode(code);
    if (short && (!short.expiresAt || short.expiresAt.getTime() > Date.now())) {
      await this.repository.incrementAccess(code);
      if (short.expiresAt) {
        const ttlSeconds = Math.floor(
          (short.expiresAt.getTime() - Date.now()) / 1000,
        );
        if (ttlSeconds > 0) {
          await this.cache.set(code, short.originalUrl, ttlSeconds);
        }
      } else {
        await this.cache.set(code, short.originalUrl);
      }
      return short.originalUrl;
    }
    return undefined;
  }

  private validateUrl(url: string): void {
    try {
      new URL(url);
    } catch {
      throw new BadRequestException('Invalid URL');
    }
  }
}
