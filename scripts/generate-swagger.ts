import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import { AppModule } from '../src/app.module';

async function generate() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('URL Shortener API')
    .setDescription('API to shorten URLs')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  writeFileSync('docs/swagger.json', JSON.stringify(document, null, 2));
  await app.close();
}

void generate();
