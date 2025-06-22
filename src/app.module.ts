import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ShortenerModule } from './shortener/shortener.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGO_URL ?? 'mongodb://localhost/nest',
    ),
    ShortenerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
