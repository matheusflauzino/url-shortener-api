import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ShortUrl, ShortUrlSchema } from './entities/short-url.schema';
import { ShortenerController } from './shortener.controller';
import { ShortenerService } from './shortener.service';
import { ShortCodeService } from './short-code.service';
import { ShortUrlRepository } from './short-url.repository';
import { CacheService } from '../common/cache.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ShortUrl.name, schema: ShortUrlSchema }]),
    ClientsModule.register([
      {
        name: 'SHORTENER_REDIS',
        transport: Transport.REDIS,
        options: ((): Record<string, unknown> => {
          const url = process.env.REDIS_URL ?? 'redis://localhost:6379';
          const { hostname, port } = new URL(url);
          return {
            host: hostname,
            port: port ? parseInt(port, 10) : 6379,
            retryAttempts: 3,
            retryDelay: 1000,
          };
        })(),
      },
    ]),
    AuthModule,
  ],
  controllers: [ShortenerController],
  providers: [
    ShortenerService,
    ShortCodeService,
    ShortUrlRepository,
    CacheService,
  ],
})
export class ShortenerModule {}
