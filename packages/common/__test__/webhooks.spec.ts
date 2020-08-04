import { Webhooks } from '@octokit/webhooks';

import { replaceParams, downloadConfig, createJobCommand } from '../webhooks';
import { DeepPartial } from '../../types';

const TEMPLATE = `{
    "xxx": "\${{ a.b }}",
    "www": "\${{ a.d }}",
    "ppp": "\${{ a.e }}",
    "yyy": {
        "zzz": "\${{ a.c }}"
    }
}`;

const EXPECTED_STR = `{
    "xxx": "1",
    "www": "1",
    "ppp": "true",
    "yyy": {
        "zzz": "{\"d\":2}"
    }
}`;

test('replaceParams', () => {
    expect(
        replaceParams(TEMPLATE, {
            a: {
                b: 1,
                d: '1',
                e: true,
                c: {
                    d: 2,
                },
            },
        }),
    ).toBe(EXPECTED_STR);
});

test('downloadConfig', async () => {
    const event: DeepPartial<Webhooks.WebhookPayloadPullRequest> = {
        action: 'edit',
        repository: {
            name: 'simple-hook-test',
            default_branch: 'master',
            git_url: 'https://github.com/IIIristraM/simple-hook-test.git',
        },
        pull_request: {
            head: {
                ref: 'config',
            },
        },
    };

    const config = await downloadConfig(event as any);
    expect(config).toEqual({
        jobs: [
            {
                id: 'test-job',
                events: [
                    {
                        id: 'pull_request',
                        actions: ['edit'],
                    },
                ],
                command: './test.sh',
                env: {
                    REPO_NAME: 'simple-hook-test',
                },
            },
        ],
    });
});

test('createJobCommand', () => {
    expect(
        createJobCommand({
            id: '',
            events: [],
            command: 'xxx',
            env: {
                X: '1',
                Y: '2 2',
            },
        }),
    ).toBe('X="1" Y="2 2" xxx');
});
