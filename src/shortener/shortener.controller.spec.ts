/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { ShortenerController } from './shortener.controller';
import { ShortenerService } from './shortener.service';
import { ShortCodeService } from './short-code.service';
import { ShortUrlRepository } from './short-url.repository';
import { NotFoundException } from '@nestjs/common';
import { ShortUrl, ShortUrlSchema } from './entities/short-url.schema';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

describe('ShortenerController', () => {
  let controller: ShortenerController;
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGO_URL = mongod.getUri();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(process.env.MONGO_URL as string),
        MongooseModule.forFeature([{ name: ShortUrl.name, schema: ShortUrlSchema }]),
      ],
      controllers: [ShortenerController],
      providers: [ShortenerService, ShortCodeService, ShortUrlRepository],
    }).compile();

    controller = module.get<ShortenerController>(ShortenerController);
  });

  describe('shorten', () => {
    it('should return a short url', async () => {
      const result = await controller.shorten('https://example.com');
      expect(result.shortUrl).toContain('http://localhost:3000/');
      expect(result.shortUrl.split('/').pop()!.length).toBe(6);
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
