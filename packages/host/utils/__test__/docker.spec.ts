import Webhooks from '@octokit/webhooks';

import { buildBaseImage, runImage, removeImage } from '../docker';
import { DeepPartial } from '../../../types/helpers';

let tag: string;
let id: string;

test('buildBaseImage', async () => {
    tag = await buildBaseImage();
}, 20000);

test('runImage', async () => {
    const event: DeepPartial<Webhooks.WebhookPayloadPullRequest> = {
        repository: {
            name: 'simple-hook-test',
            git_url: 'https://github.com/IIIristraM/simple-hook-test.git',
            default_branch: 'master',
        },
        pull_request: {
            head: {
                ref: 'master',
            },
            body: '"<div></div>"',
        },
    };

    id = await runImage(tag, event as any, 8001);

    expect(typeof id === 'string');
}, 20000);

test('removeImage', async () => {
    await removeImage(tag);
}, 20000);
