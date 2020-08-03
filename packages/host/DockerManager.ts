import { WebhookEvent } from '../types/webhook';
import { runImage, removeContainer } from './utils/docker';
import { logger } from '../common/logger';
import { createQueue } from './utils/queue';

export type ContainerInfo = {
    id: string;
    promise: Promise<unknown>;
};

export type RunArgs = [string, WebhookEvent, number];

const CONTAINERS: Record<string, ContainerInfo> = {};
const CONTAINER_RESOLVERS: Record<string, { resolve: Function; reject: Function }> = {};

export function getOrRegisterContainer(containerId: string) {
    return (CONTAINERS[containerId] = CONTAINERS[containerId] || {
        id: containerId,
        promise: new Promise((resolve, reject) => {
            CONTAINER_RESOLVERS[containerId] = { resolve, reject };
        }),
    });
}

export async function destroyContainer(containerId: string) {
    await removeContainer(containerId);
    delete CONTAINERS[containerId];
    CONTAINER_RESOLVERS[containerId].resolve();
    delete CONTAINER_RESOLVERS[containerId];
}

const queue = createQueue<RunArgs>({
    createTask: async runArgs => {
        const id = await runImage(...runArgs);

        logger.info('Container running', id);
        return {
            done: getOrRegisterContainer(id).promise,
        };
    },
});

export function run(...args: RunArgs) {
    queue.push(args);
}

export async function complete(containerId: string) {
    await destroyContainer(containerId);
}
