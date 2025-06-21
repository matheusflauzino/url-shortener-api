import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class AppService {
  private urlMap = new Map<string, string>();

  getHello(): string {
    return 'Hello World!';
  }

  getHealth(): string {
    return 'OK';
  }

  shorten(url: string): string {
    this.validateUrl(url);
    let code = this.generateCode();
    while (this.urlMap.has(code)) {
      code = this.generateCode();
    }
    this.urlMap.set(code, url);
    return code;
  }

  private validateUrl(url: string): void {
    try {
      new URL(url);
    } catch {
      throw new BadRequestException('Invalid URL');
    }
  }

  private generateCode(length = 6): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
