/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { ShortenerController } from './shortener.controller';
import { ShortenerService } from './shortener.service';
import { ShortCodeService } from './short-code.service';
import { ShortUrlRepository } from './short-url.repository';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateShortUrlDto } from './dto/create-short-url.dto';

class FakeShortUrlRepository {
  private store = new Map<string, any>();

  async create(originalUrl: string, shortCode: string) {
    const item = { originalUrl, shortCode, createdAt: new Date(), accessCount: 0 };
    this.store.set(shortCode, item);
    return item;
  }

  async findByCode(code: string) {
    return this.store.get(code);
  }

  async incrementAccess(code: string) {
    const item = this.store.get(code);
    if (item) item.accessCount++;
  }
}

describe('ShortenerController', () => {
  let controller: ShortenerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShortenerController],
      providers: [
        ShortenerService,
        ShortCodeService,
        { provide: ShortUrlRepository, useClass: FakeShortUrlRepository },
        {
          provide: 'SHORTENER_REDIS',
          useValue: {
            emit: jest.fn(),
            status: { subscribe: jest.fn() },
            on: jest.fn(),
            connect: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ShortenerController>(ShortenerController);
  });

  describe('shorten', () => {
    it('should return a short url', async () => {
      const dto: CreateShortUrlDto = { url: 'https://example.com' };
      const result = await controller.shorten(dto);
      expect(result.shortUrl).toContain('http://localhost:3000/');
      expect(result.shortUrl.split('/').pop()!.length).toBe(6);
    });
    it('should throw BadRequestException for invalid url', async () => {
      const dto: CreateShortUrlDto = { url: 'invalid-url' };
      const pipe = new (require('@nestjs/common').ValidationPipe)({ whitelist: true });
      await expect(
        pipe.transform(dto, {
          type: 'body',
          metatype: CreateShortUrlDto,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('redirect', () => {
    it('should redirect to original url', async () => {
      const dto: CreateShortUrlDto = { url: 'https://example.com' };
      const result = await controller.shorten(dto);
      const code = result.shortUrl.split('/').pop()!;
      const redirectMock = jest.fn();
      const res = { redirect: redirectMock } as any;
      await controller.redirect(code, res);
      expect(redirectMock).toHaveBeenCalledWith('https://example.com');
    });

    it('should throw NotFoundException for unknown code', async () => {
      const res = { redirect: jest.fn() } as any;
      await expect(controller.redirect('unknown', res)).rejects.toThrow(NotFoundException);
    });
  });
});
