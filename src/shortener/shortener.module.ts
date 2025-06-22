import { Module } from '@nestjs/common';
import { ShortenerController } from './shortener.controller';
import { ShortenerService } from './shortener.service';
import { ShortCodeService } from './short-code.service';
import { ShortUrlRepository } from './short-url.repository';

@Module({
  controllers: [ShortenerController],
  providers: [ShortenerService, ShortCodeService, ShortUrlRepository],
})
export class ShortenerModule {}
