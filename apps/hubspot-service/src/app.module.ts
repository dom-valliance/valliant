import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { HubSpotModule } from './hubspot/hubspot.module';
import { SyncModule } from './sync/sync.module';

@Module({
  imports: [
    // Configure BullMQ with Redis
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    HubSpotModule,
    SyncModule,
  ],
})
export class AppModule {}
