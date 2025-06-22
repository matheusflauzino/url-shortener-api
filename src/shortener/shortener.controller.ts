import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  Req,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { UrlValidationPipe } from '../common/pipes/url-validation.pipe';
import { ShortenerService } from './shortener.service';
import * as QRCode from 'qrcode';

@ApiTags('shortener')
@Controller()
export class ShortenerController {
  constructor(
    private readonly shortenerService: ShortenerService,
    @InjectPinoLogger(ShortenerController.name)
    private readonly logger: PinoLogger,
  ) {}

  @Post('shorten')
  @ApiOperation({ summary: 'Create a shortened URL' })
  @ApiBody({
    description: 'URL to shorten',
    schema: { example: { url: 'https://example.com' } },
  })
  @ApiResponse({
    status: 201,
    description: 'Shortened URL',
    schema: { example: { shortUrl: 'http://localhost:3000/abc123' } },
  })
  @ApiResponse({ status: 400, description: 'Invalid URL' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async shorten(
    @Body('url', new UrlValidationPipe()) url: string,
    @Req() req: Request,
  ): Promise<{ shortUrl: string }> {
    const code = await this.shortenerService.shorten(url);
    const baseUrl = process.env.BASE_URL ?? 'http://localhost:3000';
    this.logger.info(
      {
        ip: req.ip,
        shortCode: code,
        userAgent: req.headers['user-agent'],
      },
      'shortened url',
    );
    return { shortUrl: `${baseUrl}/${code}` };
  }

  @Get(':code')
  @ApiOperation({ summary: 'Redirect using short code' })
  @ApiParam({ name: 'code', description: 'Generated short code' })
  @ApiResponse({ status: 302, description: 'Redirection to the original URL' })
  @ApiResponse({ status: 404, description: 'URL not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async redirect(
    @Param('code') code: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const url = await this.shortenerService.getUrl(code);
    if (!url) {
      this.logger.warn(
        { ip: req.ip, shortCode: code, userAgent: req.headers['user-agent'] },
        'redirect not found',
      );
      throw new NotFoundException('URL not found');
    }
    res.redirect(url);
    this.logger.info(
      {
        ip: req.ip,
        shortCode: code,
        userAgent: req.headers['user-agent'],
        status: res.statusCode,
      },
      'redirect',
    );
    return res;
  }

  @Get(':code/qrcode')
  @ApiOperation({ summary: 'Get QR Code for short URL' })
  @ApiParam({ name: 'code', description: 'Generated short code' })
  @ApiResponse({ status: 200, description: 'QR Code image' })
  @ApiResponse({ status: 404, description: 'URL not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async qrcode(@Param('code') code: string, @Res() res: Response) {
    const url = await this.shortenerService.getUrl(code);
    if (!url) {
      throw new NotFoundException('URL not found');
    }
    const baseUrl = process.env.BASE_URL ?? 'http://localhost:3000';
    const shortUrl = `${baseUrl}/${code}`;
    const svg = await QRCode.toString(shortUrl, { type: 'svg' });
    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(svg);
  }
}
