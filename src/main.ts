import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  const microservice = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: {
      url: process.env.REDIS_URL ?? 'redis://localhost:6379',
      wildcards: true,
      retryAttempts: 3,
      retryDelay: 1000,
    },
  });

  await app.startAllMicroservices();
  const logger = new Logger('Bootstrap');
  microservice.status.subscribe((status) =>
    logger.log(`Redis status: ${status}`),
  );
  microservice.on('error', (err: Error) =>
    logger.error(`Redis error: ${err.message}`),
  );

  await app.listen(process.env.PORT ?? 3000);
  logger.log(`Server running on port ${process.env.PORT ?? 3000}`);
}
void bootstrap();
