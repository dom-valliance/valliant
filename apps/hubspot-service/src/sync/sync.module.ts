import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { SyncService } from './sync.service';
import { SyncProcessor } from './sync.processor';
import { SyncController } from './sync.controller';
import { HubSpotModule } from '../hubspot/hubspot.module';

@Module({
  imports: [
    HubSpotModule,
    BullModule.registerQueue({
      name: 'hubspot-sync',
    }),
  ],
  providers: [SyncService, SyncProcessor],
  controllers: [SyncController],
})
export class SyncModule {}
