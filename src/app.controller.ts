import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
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

  @Get(':code')
  redirect(@Param('code') code: string, @Res() res: Response) {
    const url = this.appService.getUrl(code);
    if (!url) {
      throw new NotFoundException('URL not found');
    }
    return res.redirect(url);
  }
}
