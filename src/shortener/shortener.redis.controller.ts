import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ShortenerService } from './shortener.service';

@Controller()
export class ShortenerRedisController {
  constructor(private readonly shortenerService: ShortenerService) {}

  @MessagePattern('shorten')
  async shorten(@Payload() url: string): Promise<string> {
    return this.shortenerService.shorten(url);
  }

  @MessagePattern('get_url')
  async getUrl(@Payload() code: string): Promise<string | null> {
    return (await this.shortenerService.getUrl(code)) ?? null;
  }
}
