import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ShortUrl, ShortUrlSchema } from './entities/short-url.schema';
import { ShortenerController } from './shortener.controller';
import { ShortenerService } from './shortener.service';
import { ShortCodeService } from './short-code.service';
import { ShortUrlRepository } from './short-url.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ShortUrl.name, schema: ShortUrlSchema }]),
  ],
  controllers: [ShortenerController],
  providers: [ShortenerService, ShortCodeService, ShortUrlRepository],
})
export class ShortenerModule {}
