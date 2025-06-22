import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: (() => {
      const url = process.env.REDIS_URL ?? 'redis://localhost:6379';
      const { hostname, port } = new URL(url);
      return {
        host: hostname,
        port: port ? parseInt(port, 10) : 6379,
        retryAttempts: 3,
        retryDelay: 1000,
        wildcards: true,
      };
    })(),
  });

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3000);
  const logger = new Logger('Bootstrap');
  logger.log(`Server running on port ${process.env.PORT ?? 3000}`);
}
void bootstrap();
