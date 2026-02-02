import { Module } from '@nestjs/common';
import { AllocationsModule } from './allocations/allocations.module';
import { TimeLogsModule } from './time-logs/time-logs.module';
import { AvailabilityModule } from './availability/availability.module';
import { AIModule } from './ai/ai.module';

@Module({
  imports: [AllocationsModule, TimeLogsModule, AvailabilityModule, AIModule],
})
export class AppModule {}
