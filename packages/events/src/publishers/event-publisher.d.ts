import { VRMEvent } from '../definitions/event-types';
export declare class EventPublisher {
    private redis;
    private readonly eventChannel;
    constructor(redisUrl: string);
    publish(event: VRMEvent): Promise<void>;
    disconnect(): Promise<void>;
}
//# sourceMappingURL=event-publisher.d.ts.map