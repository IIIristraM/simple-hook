import http from 'http';
import path from 'path';
import fs from 'fs';

import { WebhookEvent, WebhookPullRequestEvent } from '../types/webhook';
import { Message } from '../types/communication';
import { cloneBranch } from './git';

const [, , cid, eventStr, port] = [...process.argv];

const REPO_PATH = path.join(__dirname, 'repo');

function isPullRequestEvent(event: any): event is WebhookPullRequestEvent {
    return !!event.pull_request;
}

function getBranch(event: WebhookEvent) {
    const { default_branch } = event.repository;
    return isPullRequestEvent(event) ? event.pull_request.head.ref : default_branch;
}

function report(message: Message<any>) {
    const request = http.request({
        method: 'post',
        host: 'host.docker.internal',
        path: '/message',
        port,
        headers: {
            'Content-Type': 'application/json',
            'Container-ID': cid,
        },
    });

    request.write(JSON.stringify(message), 'utf8');

    request.end();
}

async function main() {
    const event: WebhookEvent = JSON.parse(eventStr);
    const { git_url } = event.repository;

    const branch = getBranch(event);
    await cloneBranch(git_url, branch, REPO_PATH);

    report({
        type: 'info',
        data: {
            step: 'checkout',
            branch,
            content: fs.readdirSync(`${REPO_PATH}/${event.repository.name}`),
        },
    });

    report({
        type: 'complete',
        data: 'success',
    });
}

main().catch(error => {
    report({
        type: 'complete',
        data: `${error.message}`,
    });
});
