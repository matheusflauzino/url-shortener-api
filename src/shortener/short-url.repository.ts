import { Injectable } from '@nestjs/common';
import { ShortUrl } from './entities/short-url.entity';

@Injectable()
export class ShortUrlRepository {
  private urls = new Map<string, ShortUrl>();
  private idCounter = 0;

  create(originalUrl: string, shortCode: string): ShortUrl {
    const shortUrl = new ShortUrl({
      id: (++this.idCounter).toString(),
      originalUrl,
      shortCode,
      createdAt: new Date(),
      accessCount: 0,
    });
    this.urls.set(shortCode, shortUrl);
    return shortUrl;
  }

  findByCode(shortCode: string): ShortUrl | undefined {
    return this.urls.get(shortCode);
  }

  incrementAccess(shortCode: string): void {
    const url = this.urls.get(shortCode);
    if (url) {
      url.accessCount = (url.accessCount ?? 0) + 1;
    }
  }
}
