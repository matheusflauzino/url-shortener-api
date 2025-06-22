import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import { ShortUrl, ShortUrlSchema } from './entities/short-url.schema';
import { ShortenerController } from './shortener.controller';
import { ShortenerRedisController } from './shortener.redis.controller';
import { ShortenerService } from './shortener.service';
import { ShortCodeService } from './short-code.service';
import { ShortUrlRepository } from './short-url.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ShortUrl.name, schema: ShortUrlSchema },
    ]),
    ClientsModule.register([
      {
        name: 'SHORTENER_SERVICE',
        transport: Transport.REDIS,
        options: {
          url: process.env.REDIS_URL ?? 'redis://localhost:6379',
          retryAttempts: 3,
          retryDelay: 1000,
        },
      },
    ]),
  ],
  controllers: [ShortenerController, ShortenerRedisController],
  providers: [ShortenerService, ShortCodeService, ShortUrlRepository],
})
export class ShortenerModule {}
