import { Body, Controller, Get, Param, Post, Res, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { ShortenerService } from './shortener.service';

@Controller()
export class ShortenerController {
  constructor(private readonly shortenerService: ShortenerService) {}

  @Post('shorten')
  shorten(@Body('url') url: string): { shortUrl: string } {
    const code = this.shortenerService.shorten(url);
    const baseUrl = process.env.BASE_URL ?? 'http://localhost:3000';
    return { shortUrl: `${baseUrl}/${code}` };
  }

  @Get(':code')
  redirect(@Param('code') code: string, @Res() res: Response) {
    const url = this.shortenerService.getUrl(code);
    if (!url) {
      throw new NotFoundException('URL not found');
    }
    return res.redirect(url);
  }
}
