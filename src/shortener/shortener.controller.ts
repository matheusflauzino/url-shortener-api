import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { Response } from 'express';
import { CreateShortUrlDto } from './dto/create-short-url.dto';

@Controller()
export class ShortenerController {
  constructor(
    @Inject('SHORTENER_SERVICE') private readonly client: ClientProxy,
  ) {}

  @Post('shorten')
  async shorten(@Body() dto: CreateShortUrlDto): Promise<{ shortUrl: string }> {
    const code: string = await lastValueFrom(
      this.client.send('shorten', dto.url),
    );
    const baseUrl = process.env.BASE_URL ?? 'http://localhost:3000';
    return { shortUrl: `${baseUrl}/${code}` };
  }

  @Get(':code')
  async redirect(@Param('code') code: string, @Res() res: Response) {
    const url: string | null = await lastValueFrom(
      this.client.send('get_url', code),
    );
    if (!url) {
      throw new NotFoundException('URL not found');
    }
    return res.redirect(url);
  }
}
