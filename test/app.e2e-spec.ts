/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import mongoose from 'mongoose';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import { AppDataSource } from '../data-source';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let token: string;

  beforeAll(() => {
    if (!process.env.MONGO_URL) {
      process.env.MONGO_URL = 'mongodb://localhost/url-shortener-test';
    }
    if (!process.env.MYSQL_HOST) {
      process.env.MYSQL_HOST = 'localhost';
      process.env.MYSQL_USER = 'root';
      process.env.MYSQL_PASSWORD = 'root';
      process.env.MYSQL_DB = 'url_shortener_test';
    }
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });

  beforeEach(async () => {
    dataSource = await AppDataSource.initialize();
    await dataSource.runMigrations();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ username: 'john', password: 'changeme' })
      .expect(201);
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'john', password: 'changeme' })
      .expect(201);
    token = login.body.access_token;
  });

  afterEach(async () => {
    const db = mongoose.connection.db;
    if (db) {
      await db.dropDatabase();
    }
    if (dataSource && dataSource.isInitialized) {
      const entities = dataSource.entityMetadatas;
      for (const entity of entities) {
        const repository = dataSource.getRepository(entity.name);
        await repository.clear();
      }
    }
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
      .set('Authorization', `Bearer ${token}`)
      .send({ url: 'https://example.com' })
      .expect(201);
    expect(response.body).toHaveProperty('shortUrl');
  });
  it('/invalid url (POST)', async () => {
    await request(app.getHttpServer())
      .post('/shorten')
      .set('Authorization', `Bearer ${token}`)
      .send({ url: 'invalid-url' })
      .expect(400);
  });

  it('/:code (GET)', async () => {
    const short = await request(app.getHttpServer())
      .post('/shorten')
      .set('Authorization', `Bearer ${token}`)
      .send({ url: 'https://example.com' })
      .expect(201);
    const code = short.body.shortUrl.split('/').pop();
    await request(app.getHttpServer())
      .get(`/${code}`)
      .expect(302)
      .expect('Location', 'https://example.com');
  });

  it('/:code/qrcode (GET)', async () => {
    const short = await request(app.getHttpServer())
      .post('/shorten')
      .set('Authorization', `Bearer ${token}`)
      .send({ url: 'https://example.com' })
      .expect(201);
    const code = short.body.shortUrl.split('/').pop();
    const res = await request(app.getHttpServer())
      .get(`/${code}/qrcode`)
      .expect(200);
    expect(res.headers['content-type']).toContain('image/svg+xml');
  });

  it('/unknown code (GET)', () => {
    return request(app.getHttpServer()).get('/unknown').expect(404);
  });

  it('/metrics (GET)', async () => {
    const res = await request(app.getHttpServer()).get('/metrics').expect(200);
    expect(res.text).toContain('# HELP');
  });
});
