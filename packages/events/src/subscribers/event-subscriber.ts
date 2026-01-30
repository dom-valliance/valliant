import Redis from 'ioredis';
import { VRMEvent, EventType } from '../definitions/event-types';

export type EventHandler = (event: VRMEvent) => Promise<void> | void;

export class EventSubscriber {
  private redis: Redis;
  private readonly eventChannel = 'vrm:events';
  private handlers: Map<EventType, EventHandler[]> = new Map();

  constructor(redisUrl: string) {
    this.redis = new Redis(redisUrl);
    this.setupSubscription();
  }

  private setupSubscription(): void {
    this.redis.subscribe(this.eventChannel, (err, count) => {
      if (err) {
        console.error('Failed to subscribe:', err);
      } else {
        console.log(`Subscribed to ${count} channel(s)`);
      }
    });

    this.redis.on('message', async (channel, message) => {
      if (channel === this.eventChannel) {
        try {
          const event: VRMEvent = JSON.parse(message);
          await this.handleEvent(event);
        } catch (error) {
          console.error('Failed to handle event:', error);
        }
      }
    });
  }

  on(eventType: EventType, handler: EventHandler): void {
    const handlers = this.handlers.get(eventType) || [];
    handlers.push(handler);
    this.handlers.set(eventType, handlers);
  }

  private async handleEvent(event: VRMEvent): Promise<void> {
    const handlers = this.handlers.get(event.type) || [];
    for (const handler of handlers) {
      try {
        await handler(event);
      } catch (error) {
        console.error(`Handler failed for event ${event.type}:`, error);
      }
    }
  }

  async disconnect(): Promise<void> {
    await this.redis.quit();
  }
}
