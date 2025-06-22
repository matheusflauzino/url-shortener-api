/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { ShortenerController } from './shortener.controller';
import { ShortenerService } from './shortener.service';
import { ShortCodeService } from './short-code.service';
import { ShortUrlRepository } from './short-url.repository';
import { CacheService } from '../common/cache.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';


interface FakeShortUrl {
  originalUrl: string;
  shortCode: string;
  createdAt: Date;
  expiresAt?: Date;

  accessCount: number;
}

class FakeShortUrlRepository {
  private store = new Map<string, FakeShortUrl>();

  create(originalUrl: string, shortCode: string, expiresAt?: Date) {
    const item: FakeShortUrl = {
      originalUrl,
      shortCode,
      createdAt: new Date(),
      accessCount: 0,
    };
    this.store.set(shortCode, item);
    return Promise.resolve(item);
  }

  findByCode(code: string) {
    return Promise.resolve(this.store.get(code) ?? null);
  }

  incrementAccess(code: string) {
    const item = this.store.get(code);
    if (item) item.accessCount++;
    return Promise.resolve();
  }
}

describe('ShortenerController', () => {
  let module: TestingModule;

  const createController = async () => {
    module = await Test.createTestingModule({
      controllers: [ShortenerController],
      providers: [
        ShortenerService,
        ShortCodeService,
        { provide: ShortUrlRepository, useClass: FakeShortUrlRepository },
        CacheService,
      ],
    }).compile();

    return module.get<ShortenerController>(ShortenerController);
  };

  afterEach(async () => {
    if (module) {
      await module.close();
    }
    delete process.env.URL_TTL_DAYS;
  });

  describe('shorten', () => {
    it('should return a short url', async () => {
      const controller = await createController();
      const result = await controller.shorten('https://example.com');
      expect(result.shortUrl).toContain('http://localhost:3000/');
      expect(result.shortUrl.split('/').pop()!.length).toBe(6);
    });
    it('should throw BadRequestException for invalid url', async () => {
      const controller = await createController();
      await expect(controller.shorten('invalid-url')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('redirect', () => {
    it('should redirect to original url', async () => {
      const controller = await createController();
      const result = await controller.shorten('https://example.com');
      const code = result.shortUrl.split('/').pop()!;
      const redirectMock = jest.fn();
      const res = { redirect: redirectMock } as any;
      await controller.redirect(code, res);
      expect(redirectMock).toHaveBeenCalledWith('https://example.com');
    });

    it('should throw NotFoundException for unknown code', async () => {
      const controller = await createController();
      const res = { redirect: jest.fn() } as any;
      await expect(controller.redirect('unknown', res)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException for expired code', async () => {
      process.env.URL_TTL_DAYS = '0';
      const controller = await createController();
      const result = await controller.shorten('https://example.com');
      const code = result.shortUrl.split('/').pop()!;
      const res = { redirect: jest.fn() } as any;
      await expect(controller.redirect(code, res)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
