/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
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
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer()).get('/health').expect(200).expect('OK');
  });

  it('/shorten (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/shorten')
      .send({ url: 'https://example.com' })
      .expect(201);
    expect(response.body).toHaveProperty('shortUrl');
  });

  it('/:code (GET)', async () => {
    const short = await request(app.getHttpServer())
      .post('/shorten')
      .send({ url: 'https://example.com' })
      .expect(201);
    const code = short.body.shortUrl.split('/').pop();
    await request(app.getHttpServer())
      .get(`/${code}`)
      .expect(302)
      .expect('Location', 'https://example.com');
  });

  it('/unknown code (GET)', () => {
    return request(app.getHttpServer()).get('/unknown').expect(404);
  });
});
