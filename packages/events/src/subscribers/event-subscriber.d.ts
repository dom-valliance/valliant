import { VRMEvent, EventType } from '../definitions/event-types';
export type EventHandler = (event: VRMEvent) => Promise<void> | void;
export declare class EventSubscriber {
    private redis;
    private readonly eventChannel;
    private handlers;
    constructor(redisUrl: string);
    private setupSubscription;
    on(eventType: EventType, handler: EventHandler): void;
    private handleEvent;
    disconnect(): Promise<void>;
}
//# sourceMappingURL=event-subscriber.d.ts.map