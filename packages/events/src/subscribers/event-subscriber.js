"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventSubscriber = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
class EventSubscriber {
    redis;
    eventChannel = 'vrm:events';
    handlers = new Map();
    constructor(redisUrl) {
        this.redis = new ioredis_1.default(redisUrl);
        this.setupSubscription();
    }
    setupSubscription() {
        this.redis.subscribe(this.eventChannel, (err, count) => {
            if (err) {
                console.error('Failed to subscribe:', err);
            }
            else {
                console.log(`Subscribed to ${count} channel(s)`);
            }
        });
        this.redis.on('message', async (channel, message) => {
            if (channel === this.eventChannel) {
                try {
                    const event = JSON.parse(message);
                    await this.handleEvent(event);
                }
                catch (error) {
                    console.error('Failed to handle event:', error);
                }
            }
        });
    }
    on(eventType, handler) {
        const handlers = this.handlers.get(eventType) || [];
        handlers.push(handler);
        this.handlers.set(eventType, handlers);
    }
    async handleEvent(event) {
        const handlers = this.handlers.get(event.type) || [];
        for (const handler of handlers) {
            try {
                await handler(event);
            }
            catch (error) {
                console.error(`Handler failed for event ${event.type}:`, error);
            }
        }
    }
    async disconnect() {
        await this.redis.quit();
    }
}
exports.EventSubscriber = EventSubscriber;
//# sourceMappingURL=event-subscriber.js.map