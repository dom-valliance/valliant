import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env from root directory
config({ path: resolve(__dirname, '../../../.env') });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  app.enableCors();

  const port = process.env.PORT || 4003;
  await app.listen(port);

  console.log(`🚀 Scheduling Service running on http://localhost:${port}`);
}

bootstrap();
