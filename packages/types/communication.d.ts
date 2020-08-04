import { WebhookEvent, WebhookJob } from './webhook';

export type Message<T> = {
    type: 'info' | 'complete';
    data: T;
};

export type Event = {
    type: string;
    payload: WebhookEvent;
};

export type ContainerData = {
    job: WebhookJob;
    event: Event;
};
