import { logger } from '../../common/logger';

const CONCURRENT_LIMIT = 3;

export function createQueue<Q>({
    createTask,
    concurrentLimit = CONCURRENT_LIMIT,
}: {
    createTask: (
        item: Q,
    ) => Promise<{
        done: Promise<unknown>;
    }>;
    concurrentLimit?: number;
}) {
    const QUEUE: Q[] = [];
    let EXECUTION_PROMISE: Promise<unknown> | undefined | null;

    function push(item: Q) {
        QUEUE.push(item);
        tryExecute();
    }

    function tryExecute() {
        EXECUTION_PROMISE =
            EXECUTION_PROMISE ||
            executeQueue()
                .catch(() => null)
                .finally(() => {
                    EXECUTION_PROMISE = null;
                    logger.info('Queue is empty');
                });

        return EXECUTION_PROMISE;
    }

    function done() {
        return EXECUTION_PROMISE || Promise.resolve();
    }

    async function executeQueue() {
        let runningPromises: Promise<unknown>[] = [];

        while (QUEUE.length) {
            const freeQuotas = Math.max(0, concurrentLimit - runningPromises.length);
            if (freeQuotas === 0) {
                await Promise.race(runningPromises);
                continue;
            }

            logger.info(`${QUEUE.length} items left in queue`);
            const items = QUEUE.splice(0, freeQuotas);

            const tasks = await Promise.all(items.map(createTask));
            runningPromises.push(
                ...tasks.map(({ done }) => {
                    const promise = done
                        .catch(() => null)
                        .finally(() => {
                            runningPromises = runningPromises.filter(p => p !== promise);
                        });

                    return promise;
                }),
            );
        }
    }

    return {
        push,
        done,
    };
}
