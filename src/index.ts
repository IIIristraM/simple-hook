import express from 'express';
import bodyParser from 'body-parser';

import { logger } from './utils/logger';
import { buildBaseImage } from './utils/docker';
import { CONTAINER_ID_HEADER } from './consts';
import { run, complete } from './DockerManager';

const PORT = 8000;

async function main() {
    const tag = await buildBaseImage();

    const app = express();
    app.use(bodyParser.json());

    app.post('/run', async (req, res) => {
        try {
            run(tag, req.body, PORT);
            res.sendStatus(200);
        } catch {
            res.sendStatus(500);
        }
    });

    app.post('/complete', async (req, res) => {
        try {
            // logger.info('Complete...', req.headers, req.body?.action)
            const containerId = req.headers[CONTAINER_ID_HEADER];
            if (typeof containerId !== 'string') {
                res.status(400).send({
                    message: `Bad ${CONTAINER_ID_HEADER} header`,
                });
                return;
            }

            complete(containerId);
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
