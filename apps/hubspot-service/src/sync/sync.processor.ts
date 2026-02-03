import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { SyncService } from './sync.service';

/**
 * BullMQ Job Processor for HubSpot Sync
 * Handles scheduled and manual sync jobs
 */
@Processor('hubspot-sync')
export class SyncProcessor {
  private readonly logger = new Logger(SyncProcessor.name);

  constructor(private readonly syncService: SyncService) {}

  @Process('sync-deals')
  async handleSyncDeals(job: Job) {
    this.logger.log(`Starting sync job ${job.id}...`);

    try {
      const result = await this.syncService.syncDeals();

      this.logger.log(
        `Sync job ${job.id} completed successfully:`,
        JSON.stringify(result, null, 2)
      );

      return result;
    } catch (error: any) {
      this.logger.error(
        `Sync job ${job.id} failed: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }
}
