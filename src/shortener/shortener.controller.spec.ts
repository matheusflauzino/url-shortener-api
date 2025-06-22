/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { ShortenerController } from './shortener.controller';
import { ShortenerService } from './shortener.service';
import { ShortCodeService } from './short-code.service';
import { NotFoundException } from '@nestjs/common';

describe('ShortenerController', () => {
  let controller: ShortenerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShortenerController],
      providers: [ShortenerService, ShortCodeService],
    }).compile();

    controller = module.get<ShortenerController>(ShortenerController);
  });

  describe('shorten', () => {
    it('should return a short url', () => {
      const result = controller.shorten('https://example.com');
      expect(result.shortUrl).toContain('http://localhost:3000/');
      expect(result.shortUrl.split('/').pop()!.length).toBe(6);
    });
  });

  describe('redirect', () => {
    it('should redirect to original url', () => {
      const result = controller.shorten('https://example.com');
      const code = result.shortUrl.split('/').pop()!;
      const redirectMock = jest.fn();
      const res = { redirect: redirectMock } as any;
      controller.redirect(code, res);
      expect(redirectMock).toHaveBeenCalledWith('https://example.com');
    });

    it('should throw NotFoundException for unknown code', () => {
      const res = { redirect: jest.fn() } as any;
      expect(() => controller.redirect('unknown', res)).toThrow(NotFoundException);
    });
  });
});
