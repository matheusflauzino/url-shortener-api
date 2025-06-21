import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth(): string {
    return this.appService.getHealth();
  }

  @Post('shorten')
  shorten(@Body('url') url: string): { shortUrl: string } {
    const code = this.appService.shorten(url);
    const baseUrl = process.env.BASE_URL ?? 'http://localhost:3000';
    return { shortUrl: `${baseUrl}/${code}` };
  }
}
