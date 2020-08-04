import get from 'lodash/get';

import { WebhookEvent, WebhookPullRequestEvent, WebhooksConfig, WebhookJob } from '../types/webhook';
import { downloadFile } from './network';
import { createDownloadUrl } from './git';

export function isPullRequestEvent(event: any): event is WebhookPullRequestEvent {
    return !!event.pull_request;
}

export function getBranch(event: WebhookEvent) {
    const { default_branch } = event.repository;
    return isPullRequestEvent(event) ? event.pull_request.head.ref : default_branch;
}

export function replaceParams(str: string, data: any) {
    return str.replace(/\$\{\{(.+)\}\}/g, (substr, path) => {
        const val = get(data, path.trim());
        return val instanceof Object ? JSON.stringify(val) : val;
    });
}

export async function downloadConfig(event: WebhookEvent): Promise<WebhooksConfig> {
    const {
        repository: { git_url },
    } = event;
    const branch = getBranch(event);

    const configStr = await downloadFile(createDownloadUrl(git_url, branch, 'simple-hook.json'));
    console.log(replaceParams(configStr, event));
    return JSON.parse(replaceParams(configStr, event));
}

export function createJobCommand(job: WebhookJob) {
    return `${
        job.env
            ? Object.entries(job.env)
                  .map(([key, val]) => `${key}="${val}"`)
                  .join(' ')
            : ''
    } ${job.command}`;
}
