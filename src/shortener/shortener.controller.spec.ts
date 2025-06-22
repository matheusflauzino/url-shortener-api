/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { ShortenerController } from './shortener.controller';
import { ShortenerService } from './shortener.service';
import { ShortCodeService } from './short-code.service';
import { ShortUrlRepository } from './short-url.repository';
import { NotFoundException } from '@nestjs/common';
import { of } from 'rxjs';

interface ShortDoc {
  originalUrl: string;
  shortCode: string;
  createdAt: Date;
  accessCount: number;
}

class FakeShortUrlRepository {
  private store = new Map<string, ShortDoc>();

  create(originalUrl: string, shortCode: string): ShortDoc {
    const item = {
      originalUrl,
      shortCode,
      createdAt: new Date(),
      accessCount: 0,
    };
    this.store.set(shortCode, item);
    return item;
  }

  findByCode(code: string): ShortDoc | undefined {
    return this.store.get(code);
  }

  incrementAccess(code: string): void {
    const item = this.store.get(code);
    if (item) item.accessCount++;
  }
}

class FakeClientProxy {
  send(pattern: string, data: any) {
    if (pattern === 'shorten') {
      return of('abcdef');
    }
    if (pattern === 'get_url') {
      return of(data === 'abcdef' ? 'https://example.com' : null);
    }
    return of(null);
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
        { provide: 'SHORTENER_SERVICE', useClass: FakeClientProxy },
      ],
    }).compile();

    controller = module.get<ShortenerController>(ShortenerController);
  });

  describe('shorten', () => {
    it('should return a short url', async () => {
      const result = await controller.shorten({
        url: 'https://example.com',
      } as any);
      expect(result.shortUrl).toContain('http://localhost:3000/');
      expect(result.shortUrl.split('/').pop()!.length).toBe(6);
    });
  });

  describe('redirect', () => {
    it('should redirect to original url', async () => {
      const result = await controller.shorten({
        url: 'https://example.com',
      } as any);
      const code = result.shortUrl.split('/').pop()!;
      const redirectMock = jest.fn();
      const res = { redirect: redirectMock } as any;
      await controller.redirect(code, res);
      expect(redirectMock).toHaveBeenCalledWith('https://example.com');
    });

    it('should throw NotFoundException for unknown code', async () => {
      const res = { redirect: jest.fn() } as any;
      await expect(controller.redirect('unknown', res)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
