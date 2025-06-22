import { Injectable, BadRequestException } from '@nestjs/common';
import { ShortCodeService } from './short-code.service';

@Injectable()
export class ShortenerService {
  private urlMap = new Map<string, string>();

  constructor(private readonly shortCode: ShortCodeService) {}

  shorten(url: string): string {
    this.validateUrl(url);
    let code = this.shortCode.generate();
    while (this.urlMap.has(code)) {
      code = this.shortCode.generate();
    }
    this.urlMap.set(code, url);
    return code;
  }

  getUrl(code: string): string | undefined {
    return this.urlMap.get(code);
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
