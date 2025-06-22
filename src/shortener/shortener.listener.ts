import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ShortUrlRepository } from './short-url.repository';

@Controller()
export class ShortenerListener {
  private readonly logger = new Logger(ShortenerListener.name);

  constructor(private readonly repository: ShortUrlRepository) {}

  @EventPattern('shortener.access')
  async handleAccess(@Payload() code: string) {
    await this.repository.incrementAccess(code);
    this.logger.debug(`Access incremented for ${code}`);
  }
}
