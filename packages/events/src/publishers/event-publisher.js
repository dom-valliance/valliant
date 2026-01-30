"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventPublisher = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
class EventPublisher {
    redis;
    eventChannel = 'vrm:events';
    constructor(redisUrl) {
        this.redis = new ioredis_1.default(redisUrl);
    }
    async publish(event) {
        try {
            await this.redis.publish(this.eventChannel, JSON.stringify(event));
            console.log(`Published event: ${event.type}`, event.metadata.correlationId);
        }
        catch (error) {
            console.error('Failed to publish event:', error);
            throw error;
        }
    }
    async disconnect() {
        await this.redis.quit();
    }
}
exports.EventPublisher = EventPublisher;
//# sourceMappingURL=event-publisher.js.map