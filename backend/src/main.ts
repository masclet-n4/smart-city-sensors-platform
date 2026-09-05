import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module.js';
import { validateEnv } from './config/env.validation.js';
import type { NestExpressApplication } from '@nestjs/platform-express';




async function bootstrap() {
  validateEnv();

  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    { bodyParser: false },
  );

  app.useBodyParser('json', { limit: '1mb' });
  app.useBodyParser('urlencoded', {
    extended: true,
    limit: '1mb',
  });


  app.enableCors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })


  app.setGlobalPrefix('api');

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}

await bootstrap();
