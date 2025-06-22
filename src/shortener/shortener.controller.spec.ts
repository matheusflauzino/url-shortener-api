/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { getLoggerToken } from 'nestjs-pino';
import { ShortenerController } from './shortener.controller';
import { ShortenerService } from './shortener.service';
import { ShortCodeService } from './short-code.service';
import { ShortUrlRepository } from './short-url.repository';
import { CacheService } from '../common/cache.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

interface ShortUrlItem {
  originalUrl: string;
  shortCode: string;
  createdAt: Date;
  accessCount: number;
  userId: number;
}

class FakeShortUrlRepository {
  private store = new Map<string, ShortUrlItem>();

  async create(
    originalUrl: string,
    shortCode: string,
    userId: number,
  ): Promise<ShortUrlItem> {
    const item = {
      originalUrl,
      shortCode,
      createdAt: new Date(),
      accessCount: 0,
      userId,
    };
    this.store.set(shortCode, item);
    return Promise.resolve(item);
  }

  async findByCode(code: string): Promise<ShortUrlItem | undefined> {
    return Promise.resolve(this.store.get(code));
  }

  async incrementAccess(code: string): Promise<void> {
    const item = this.store.get(code);
    if (item) item.accessCount++;
    return Promise.resolve();
  }
}

describe('ShortenerController', () => {
  let controller: ShortenerController;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [ShortenerController],
      providers: [
        ShortenerService,
        ShortCodeService,
        { provide: ShortUrlRepository, useClass: FakeShortUrlRepository },
        CacheService,
        {
          provide: getLoggerToken(ShortenerController.name),
          useValue: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<ShortenerController>(ShortenerController);
  });

  afterEach(async () => {
    await module.close();
  });

  describe('shorten', () => {
    it('should return a short url', async () => {
      const mockReq = {
        ip: '127.0.0.1',
        headers: { 'user-agent': 'jest' },
        user: { userId: 1 },
      } as any;
      const result = await controller.shorten('https://example.com', mockReq);
      expect(result.shortUrl).toContain('http://localhost:3000/');
      expect(result.shortUrl.split('/').pop()!.length).toBe(6);
    });
    it('should throw BadRequestException for invalid url', async () => {
      const mockReq = {
        ip: '127.0.0.1',
        headers: { 'user-agent': 'jest' },
        user: { userId: 1 },
      } as any;
      await expect(controller.shorten('invalid-url', mockReq)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('redirect', () => {
    it('should redirect to original url', async () => {
      const mockReq = {
        ip: '127.0.0.1',
        headers: { 'user-agent': 'jest' },
        user: { userId: 1 },
      } as any;
      const result = await controller.shorten('https://example.com', mockReq);
      const code = result.shortUrl.split('/').pop()!;
      const redirectMock = jest.fn();
      const res = { redirect: redirectMock } as any;
      await controller.redirect(code, res, mockReq);
      expect(redirectMock).toHaveBeenCalledWith('https://example.com');
    });

    it('should throw NotFoundException for unknown code', async () => {
      const res = { redirect: jest.fn() } as any;
      const mockReq = {
        ip: '127.0.0.1',
        headers: { 'user-agent': 'jest' },
        user: { userId: 1 },
      } as any;
      await expect(
        controller.redirect('unknown', res, mockReq),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
