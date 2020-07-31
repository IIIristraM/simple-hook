import express, { Request } from 'express';
import { Server } from 'http';
import bodyParser from 'body-parser';

import { buildBaseImage, runImage } from '../docker';
import { CONTAINER_ID_HEADER } from '../../consts';

const TEST_PORT = 8002;
const app = express();
app.use(bodyParser.json());

describe('docker to node', () => {
    test('image respond', async () => {
        let server: Server;
        const event = { test: '"test"' } as any;
        try {
            const result = await new Promise<Request>(async resolve => {
                app.post('/complete', (req, res) => {
                    resolve(req);
                    res.sendStatus(200);
                });

                await new Promise(resolve => {
                    server = app.listen(TEST_PORT, resolve);
                });

                const tag = await buildBaseImage();
                await runImage(tag, event, TEST_PORT);
            });

            expect(result.body).toEqual(event);
            expect(typeof result.headers[CONTAINER_ID_HEADER] === 'string').toBe(true);
        } finally {
            server.close();
        }
    });
});
