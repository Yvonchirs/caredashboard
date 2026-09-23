import 'reflect-metadata';
import { MikroORM } from '@mikro-orm/core';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { UPLOAD_DIR } from './activities/upload.config.js';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({ origin: process.env.CORS_ORIGIN?.split(',') ?? 'http://localhost:3000' });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useStaticAssets(UPLOAD_DIR, { prefix: '/uploads/', maxAge: '7d' });

  await app.get(MikroORM).schema.update();

  const config = new DocumentBuilder()
    .setTitle('CARE Rwanda Activity Dashboard API')
    .setDescription('Projects, staff activities and the public activity dashboard.')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, () => SwaggerModule.createDocument(app, config));

  await app.listen(process.env.PORT ?? 4000);
}

void bootstrap();
