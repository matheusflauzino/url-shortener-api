import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class UrlValidationPipe implements PipeTransform<string> {
  transform(value: string): string {
    try {
      // eslint-disable-next-line no-new
      new URL(value);
      return value;
    } catch {
      throw new BadRequestException('Invalid URL');
    }
  }
}
