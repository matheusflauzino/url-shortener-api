import { Injectable, BadRequestException } from '@nestjs/common';
import { ShortCodeService } from './short-code.service';
import { ShortUrlRepository } from './short-url.repository';

@Injectable()
export class ShortenerService {
  constructor(
    private readonly shortCode: ShortCodeService,
    private readonly repository: ShortUrlRepository,
  ) {}

  shorten(url: string): string {
    this.validateUrl(url);
    let code = this.shortCode.generate();
    while (this.repository.findByCode(code)) {
      code = this.shortCode.generate();
    }
    this.repository.create(url, code);
    return code;
  }

  getUrl(code: string): string | undefined {
    const short = this.repository.findByCode(code);
    if (short) {
      this.repository.incrementAccess(code);
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
