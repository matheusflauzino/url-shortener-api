import { Injectable, BadRequestException } from '@nestjs/common';
import { ShortCodeService } from './short-code.service';
import { ShortUrlRepository } from './short-url.repository';

@Injectable()
export class ShortenerService {
  constructor(
    private readonly shortCode: ShortCodeService,
    private readonly repository: ShortUrlRepository,
  ) {}

  async shorten(url: string): Promise<string> {
    this.validateUrl(url);
    let code = this.shortCode.generate();
    while (await this.repository.findByCode(code)) {
      code = this.shortCode.generate();
    }
    await this.repository.create(url, code);
    return code;
  }

  async getUrl(code: string): Promise<string | undefined> {
    const short = await this.repository.findByCode(code);
    if (short) {
      await this.repository.incrementAccess(code);
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
