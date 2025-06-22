import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ShortCodeService } from './short-code.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, ShortCodeService],
})
export class AppModule {}
