import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MetricsModule } from './metrics/metrics.module';
import { ShortenerModule } from './shortener/shortener.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    LoggerModule.forRoot(),
    MongooseModule.forRoot(
      process.env.MONGO_URL ?? 'mongodb://localhost/nest',
    ),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.MYSQL_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT || '3306', 10),
      username: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || 'root',
      database: process.env.MYSQL_DB || 'url_shortener',
      autoLoadEntities: true,
      synchronize: false,
      migrationsRun: true,
    }),
    MetricsModule,
    UsersModule,
    AuthModule,
    ShortenerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
