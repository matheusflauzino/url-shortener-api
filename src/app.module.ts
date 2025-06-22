import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MetricsModule } from './metrics/metrics.module';
import { ShortenerModule } from './shortener/shortener.module';

@Module({
  imports: [
    LoggerModule.forRoot(),
    MongooseModule.forRoot(
      process.env.MONGO_URL ?? 'mongodb://localhost/nest',
    ),
    MetricsModule,
    ShortenerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
