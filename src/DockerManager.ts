import { WebhookEvent } from './types/webhook';
import { runImage, removeContainer } from './utils/docker';
import { logger } from './utils/logger';

export type ContainerInfo = {
    id: string;
    promise: Promise<unknown>
}

export type RunArgs = [string, WebhookEvent, number];

const CONTAINERS: Record<string, ContainerInfo> = {}
const CONCURRENT_CONTAINERS_LIMIT = 10;
const QUEUE: RunArgs[] = [];
const CONTAINER_RESOLVERS: Record<string, {resolve: Function, reject: Function}> = {}

let EXECUTION_PROMISE: Promise<void> | undefined | null;

export function getOrRegisterContainer(containerId: string) {
    return CONTAINERS[containerId] = CONTAINERS[containerId] || {
        id: containerId,
        promise: new Promise((resolve, reject) => {
            CONTAINER_RESOLVERS[containerId] = {resolve, reject};
        })
    }
}

export async function destroyContainer(containerId: string) {
    await removeContainer(containerId);
    delete CONTAINERS[containerId]
    CONTAINER_RESOLVERS[containerId].resolve();
    delete CONTAINER_RESOLVERS[containerId];
}

export function tryExecute() {
    EXECUTION_PROMISE = EXECUTION_PROMISE || executeQueue().finally(() => {
        EXECUTION_PROMISE = null
        logger.info('All containers have been complete')
    })

    return EXECUTION_PROMISE;
}

export async function executeQueue() {
    while (QUEUE.length) {
        const runningPromises = Object.values(CONTAINERS).map(({promise}) => promise);

        const freeQuotas = Math.max(0, CONCURRENT_CONTAINERS_LIMIT - runningPromises.length)
        if (freeQuotas === 0) {
            await Promise.race(runningPromises)
        }

        const items = QUEUE.splice(0, freeQuotas);

        await Promise.all(items.map(async runArgs => {
            const id = await runImage(...runArgs)

            logger.info('Container running', id);
            getOrRegisterContainer(id);
        }))
    }
}

export function run(...args: RunArgs) {
    QUEUE.push(args);
    tryExecute();
} 

export async function complete(containerId: string) {
    await destroyContainer(containerId);
}