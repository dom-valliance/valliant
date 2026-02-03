import { Controller, Get, Post, Query, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { SyncService } from './sync.service';
import { HubSpotApiService } from '../hubspot/hubspot-api.service';

/**
 * Sync Controller
 * Provides REST endpoints for manual triggering and monitoring
 */
@Controller('sync')
export class SyncController {
  private readonly logger = new Logger(SyncController.name);

  constructor(
    private readonly syncService: SyncService,
    private readonly hubspotApi: HubSpotApiService,
    @InjectQueue('hubspot-sync') private readonly syncQueue: Queue
  ) {
    // Schedule recurring sync job (every 30 minutes)
    this.scheduleRecurringSync();
  }

  /**
   * POST /sync/trigger
   * Manually trigger a sync job
   */
  @Post('trigger')
  async triggerSync() {
    this.logger.log('Manual sync triggered via API');

    try {
      // Add job to queue with high priority
      const job = await this.syncQueue.add(
        'sync-deals',
        {},
        {
          priority: 1, // High priority for manual triggers
          attempts: 1, // Don't retry manual triggers
        }
      );

      return {
        success: true,
        message: 'Sync triggered successfully',
        jobId: job.id,
      };
    } catch (error: any) {
      this.logger.error(`Failed to trigger sync: ${error.message}`);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * GET /sync/status
   * Get current sync status and recent history
   */
  @Get('status')
  async getSyncStatus() {
    try {
      const status = await this.syncService.getSyncStatus();

      // Get queue stats
      const jobCounts = await this.syncQueue.getJobCounts();
      const activeJobs = await this.syncQueue.getActive();
      const waitingJobs = await this.syncQueue.getWaiting();

      return {
        ...status,
        queue: {
          active: jobCounts.active,
          waiting: jobCounts.waiting,
          completed: jobCounts.completed,
          failed: jobCounts.failed,
          activeJobs: activeJobs.map((job) => ({
            id: job.id,
            timestamp: job.timestamp,
          })),
          waitingJobs: waitingJobs.map((job) => ({
            id: job.id,
            timestamp: job.timestamp,
          })),
        },
      };
    } catch (error: any) {
      this.logger.error(`Failed to get sync status: ${error.message}`);
      throw error;
    }
  }

  /**
   * GET /sync/logs
   * Get sync operation logs
   */
  @Get('logs')
  async getSyncLogs(
    @Query('limit') limit?: string,
    @Query('status') status?: string
  ) {
    try {
      const limitNum = limit ? parseInt(limit, 10) : 50;
      const logs = await this.syncService.getSyncLogs(limitNum, status);

      return {
        logs,
        count: logs.length,
      };
    } catch (error: any) {
      this.logger.error(`Failed to get sync logs: ${error.message}`);
      throw error;
    }
  }

  /**
   * GET /sync/health
   * Health check endpoint
   */
  @Get('health')
  async getHealth() {
    try {
      const jobCounts = await this.syncQueue.getJobCounts();

      return {
        status: 'healthy',
        queue: {
          active: jobCounts.active,
          waiting: jobCounts.waiting,
          failed: jobCounts.failed,
        },
      };
    } catch (error: any) {
      return {
        status: 'unhealthy',
        error: error.message,
      };
    }
  }

  /**
   * GET /sync/pipelines
   * Discover available HubSpot pipelines and their stages
   * Use this to find the HUBSPOT_PIPELINE_ID and stage IDs to configure
   */
  @Get('pipelines')
  async getPipelines() {
    this.logger.log('Fetching HubSpot pipelines for configuration discovery');

    try {
      const pipelines = await this.hubspotApi.getAllPipelines();

      // Format the output for easy copy-paste into .env
      const formattedPipelines = pipelines.map((pipeline: any) => ({
        id: pipeline.id,
        label: pipeline.label,
        displayOrder: pipeline.displayOrder,
        stages: pipeline.stages?.map((stage: any) => ({
          id: stage.id,
          label: stage.label,
          displayOrder: stage.displayOrder,
        })),
        envConfig: {
          HUBSPOT_PIPELINE_ID: pipeline.id,
          stages: pipeline.stages?.reduce((acc: any, stage: any) => {
            // Create suggested env var names based on stage labels
            const envKey = `HUBSPOT_STAGE_${stage.label
              .toUpperCase()
              .replace(/[^A-Z0-9]/g, '_')
              .replace(/_+/g, '_')}`;
            acc[envKey] = stage.id;
            return acc;
          }, {}),
        },
      }));

      return {
        message: 'Use these IDs to configure your .env file',
        currentConfig: {
          HUBSPOT_PIPELINE_ID: this.hubspotApi.getPipelineId() || '(not set)',
          stages: this.hubspotApi.getStageIds(),
        },
        availablePipelines: formattedPipelines,
      };
    } catch (error: any) {
      this.logger.error(`Failed to fetch pipelines: ${error.message}`);
      return {
        error: error.message,
        hint: 'Make sure HUBSPOT_API_KEY is set correctly',
      };
    }
  }

  /**
   * Schedule recurring sync job (every 30 minutes)
   */
  private async scheduleRecurringSync() {
    const syncIntervalMs =
      parseInt(process.env.HUBSPOT_SYNC_INTERVAL_MS || '1800000', 10); // Default 30 min
    const syncEnabled =
      process.env.HUBSPOT_SYNC_ENABLED === 'true' ||
      !process.env.HUBSPOT_SYNC_ENABLED; // Enabled by default

    if (!syncEnabled) {
      this.logger.warn('HubSpot sync is DISABLED via environment variable');
      return;
    }

    this.logger.log(
      `Scheduling recurring sync every ${syncIntervalMs / 1000} seconds`
    );

    try {
      // Remove any existing repeatable jobs to avoid duplicates
      const repeatableJobs = await this.syncQueue.getRepeatableJobs();
      for (const job of repeatableJobs) {
        await this.syncQueue.removeRepeatableByKey(job.key);
      }

      // Add new repeatable job
      await this.syncQueue.add(
        'sync-deals',
        {},
        {
          repeat: {
            every: syncIntervalMs,
          },
          attempts: 3, // Retry failed syncs up to 3 times
          backoff: {
            type: 'exponential',
            delay: 5000, // Start with 5 second delay
          },
        }
      );

      this.logger.log('Recurring sync scheduled successfully');
    } catch (error: any) {
      this.logger.error(`Failed to schedule recurring sync: ${error.message}`);
    }
  }
}
