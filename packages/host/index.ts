import express from 'express';
import bodyParser from 'body-parser';

import { buildBaseImage } from './utils/docker';
import { CONTAINER_ID_HEADER, GITHUB_EVENT_HEADER } from './consts';
import { run, complete } from './DockerManager';
import { Message } from '../types/communication';
import { downloadConfig, logger } from '../common';

const PORT = 8000;

async function main() {
    const tag = await buildBaseImage();

    const app = express();
    app.use(bodyParser.json());

    app.post('/run', async (req, res) => {
        try {
            const type = req.headers[GITHUB_EVENT_HEADER];
            if (!type || typeof type !== 'string') {
                res.status(400).send({
                    message: `Bad ${GITHUB_EVENT_HEADER} header`,
                });
                return;
            }

            const config = await downloadConfig(req.body);
            const jobs = config?.jobs?.filter(job =>
                job.events.some(event => {
                    return event.id === type && (!event.actions || event.actions.includes(req.body.action));
                }),
            );

            if (!jobs?.length) {
                res.status(400).send({
                    message: `No jobs configured`,
                });
                return;
            }

            jobs.forEach(job => {
                run(tag, { job, event: { type, payload: req.body } }, PORT);
            });
            res.sendStatus(200);
        } catch {
            res.sendStatus(500);
        }
    });

    app.post('/message', async (req, res) => {
        try {
            const containerId = req.headers[CONTAINER_ID_HEADER];
            if (typeof containerId !== 'string') {
                res.status(400).send({
                    message: `Bad ${CONTAINER_ID_HEADER} header`,
                });
                return;
            }

            const message = req.body as Message<any>;
            logger.info('Message...', containerId, message);

            if (message.type === 'complete') {
                complete(containerId);
            }

            res.sendStatus(200);
        } catch {
            res.sendStatus(500);
        }
    });

    app.listen(PORT, () => {
        logger.info('Server listening...');
    });
}

main().catch(err => {
    logger.error(err);
    process.exit(1);
});
