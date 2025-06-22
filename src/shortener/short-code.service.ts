import { Injectable } from '@nestjs/common';

@Injectable()
export class ShortCodeService {
  private counter = 0;
  private readonly chars =
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

  generate(length = 6): string {
    this.counter += 1;
    let num = this.counter;
    let result = '';
    const base = this.chars.length;
    while (num > 0) {
      result = this.chars[num % base] + result;
      num = Math.floor(num / base);
    }
    if (result === '') {
      result = this.chars[0];
    }
    while (result.length < length) {
      result = this.chars[0] + result;
    }
    return result;
  }
}
