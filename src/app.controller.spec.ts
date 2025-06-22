import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NotFoundException } from '@nestjs/common';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('health', () => {
    it('should return "OK"', () => {
      expect(appController.getHealth()).toBe('OK');
    });
  });

  describe('shorten', () => {
    it('should return a short url', () => {
      const result = appController.shorten('https://example.com');
      expect(result.shortUrl).toContain('http://localhost:3000/');
      expect(result.shortUrl.split('/').pop()!.length).toBe(6);
    });
  });

  describe('redirect', () => {
    it('should redirect to original url', () => {
      const result = appController.shorten('https://example.com');
      const code = result.shortUrl.split('/').pop()!;
      const redirectMock = jest.fn();
      const res = { redirect: redirectMock } as any;
      appController.redirect(code, res);
      expect(redirectMock).toHaveBeenCalledWith('https://example.com');
    });

    it('should throw NotFoundException for unknown code', () => {
      const res = { redirect: jest.fn() } as any;
      expect(() => appController.redirect('unknown', res)).toThrow(
        NotFoundException,
      );
    });
  });
});
