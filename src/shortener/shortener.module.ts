import { Module } from '@nestjs/common';
import { ShortenerController } from './shortener.controller';
import { ShortenerService } from './shortener.service';
import { ShortCodeService } from './short-code.service';

@Module({
  controllers: [ShortenerController],
  providers: [ShortenerService, ShortCodeService],
})
export class ShortenerModule {}
