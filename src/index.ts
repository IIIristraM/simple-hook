import express from 'express';
import bodyParser from 'body-parser';

import { logger } from './utils/logger';
import { buildBaseImage, buildInstanceImage, runImage, removeImage } from './utils/docker';

const RUNNING_CONTAINERS: Record<string, string> = {}

async function main() {
    await buildBaseImage()

    const app = express();
    app.use(bodyParser.json());

    app.post('/run', async (req, res) => {
        try {
            const tag = await buildInstanceImage(req.body)
            const id = await runImage(tag);

            logger.info('Hook in process in container', id);
            RUNNING_CONTAINERS[id] = tag;
            res.sendStatus(200);
        } catch {
            res.sendStatus(500)
        }
    })

    app.post('/complete', async (req, res) => {
        try {
            logger.info('Complete...', req.headers, req.body)

            const containerId = req.headers['container-id'];
            if (!containerId || typeof containerId !== 'string' || !RUNNING_CONTAINERS[containerId]) {
                logger.warn('Unexpected container id:', containerId);
            } else {
                const tag = RUNNING_CONTAINERS[containerId];
                await removeImage(tag);
                delete RUNNING_CONTAINERS[containerId];
                logger.info('Container complete work', containerId)
            }

            res.sendStatus(200);
        } catch {
            res.sendStatus(500)
        }
    })

    app.listen(8000, () => {
        logger.info('Server listening...')
    })
}

main().catch(err => {
    logger.error(err);
    process.exit(1);
})