/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { ShortenerController } from './shortener.controller';
import { ShortenerService } from './shortener.service';
import { ShortCodeService } from './short-code.service';
import { ShortUrlRepository } from './short-url.repository';
import { CacheService } from '../common/cache.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

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
        CacheService,
      ],
    }).compile();

    controller = module.get<ShortenerController>(ShortenerController);
  });

  describe('shorten', () => {
    it('should return a short url', async () => {
      const result = await controller.shorten('https://example.com');
      expect(result.shortUrl).toContain('http://localhost:3000/');
      expect(result.shortUrl.split('/').pop()!.length).toBe(6);
    });
    it('should throw BadRequestException for invalid url', async () => {
      await expect(controller.shorten('invalid-url')).rejects.toThrow(BadRequestException);
    });
  });

  describe('redirect', () => {
    it('should redirect to original url', async () => {
      const result = await controller.shorten('https://example.com');
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
