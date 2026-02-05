import { Redis } from 'ioredis';
import { VRMEvent } from '../definitions/event-types.js';

export class EventPublisher {
  private redis: Redis;
  private readonly eventChannel = 'vrm:events';

  constructor(redisUrl: string) {
    this.redis = new Redis(redisUrl);
  }

  async publish(event: VRMEvent): Promise<void> {
    try {
      await this.redis.publish(this.eventChannel, JSON.stringify(event));
      console.log(`Published event: ${event.type}`, event.metadata.correlationId);
    } catch (error) {
      console.error('Failed to publish event:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    await this.redis.quit();
  }
}
