import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env from root directory
config({ path: resolve(__dirname, '../../../.env') });

// Add BigInt serialization support
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors();

  const port = process.env.PORT || 4002;
  await app.listen(port);
  console.log(`🚀 Project Service running on http://localhost:${port}`);
}

bootstrap();
