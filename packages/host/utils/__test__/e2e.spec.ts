import express, { Request } from 'express';
import { Server } from 'http';
import bodyParser from 'body-parser';
import { Webhooks } from '@octokit/webhooks';

import { buildBaseImage, runImage } from '../docker';
import { CONTAINER_ID_HEADER } from '../../consts';
import { DeepPartial } from '../../../types/helpers';
import { logger, downloadConfig } from '../../../common';

const TEST_PORT = 8002;
const app = express();
app.use(bodyParser.json());

describe('docker to node', () => {
    let tag: string;

    beforeAll(async () => {
        tag = await buildBaseImage();
    }, 100000);

    test('image respond', async () => {
        let server: Server | undefined;
        let id: string = '';
        const event: DeepPartial<Webhooks.WebhookPayloadPullRequest> = {
            repository: {
                name: 'simple-hook-test',
                git_url: 'https://github.com/IIIristraM/simple-hook-test.git',
                default_branch: 'master',
            },
            pull_request: {
                head: {
                    ref: 'config',
                },
            },
        };

        const config = await downloadConfig(event as any);

        try {
            const result = await new Promise<Request>(async resolve => {
                app.post('/message', (req, res) => {
                    logger.info('Message...', req.body);
                    if (req.body?.type === 'complete') {
                        resolve(req);
                    }

                    res.sendStatus(200);
                });

                await new Promise(resolve => {
                    server = app.listen(TEST_PORT, resolve);
                });

                id = await runImage(
                    tag,
                    {
                        job: config.jobs[0],
                        event: {
                            type: 'pull_request',
                            payload: event,
                        },
                    },
                    TEST_PORT,
                );
            });

            const { executionTime, ...rest } = result.body.data;

            expect(result.body.type).toEqual('complete');
            expect(rest).toEqual({
                status: 'success',
                stdout: 'Hello world from simple-hook-test',
            });
            expect(result.headers[CONTAINER_ID_HEADER]).toBe(id);
        } finally {
            server?.close();
        }
    });
});
