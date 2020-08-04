import http from 'http';
import path from 'path';
import fs from 'fs';

import { Message, ContainerData } from '../types';
import { cloneBranch, getBranch, runCommand, createJobCommand } from '../common';

const [, , cid, dataStr, port] = [...process.argv];

const REPO_PATH = path.join(__dirname, 'repo');
const START_TIME = Date.now();

function timeSinceStart() {
    const seconds = ((Date.now() - START_TIME) / 1000).toFixed(2);
    return `${seconds}s`;
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
    const data: ContainerData = JSON.parse(dataStr);
    const { type, payload } = data.event;
    const {
        repository: { git_url, name: repoName },
    } = payload;

    report({
        type: 'info',
        data: {
            step: 'data parsed',
            type,
            job: data.job.id,
        },
    });

    const branch = getBranch(payload);
    await cloneBranch(git_url, branch, REPO_PATH);

    report({
        type: 'info',
        data: {
            step: 'checkout',
            branch,
            content: fs.readdirSync(`${REPO_PATH}/${repoName}`),
        },
    });

    const command = createJobCommand(data.job);
    const stdout = await runCommand(`
        cd ${REPO_PATH}/${repoName} &&
        ${command}
    `);

    report({
        type: 'complete',
        data: {
            status: 'success',
            stdout,
            executionTime: timeSinceStart(),
        },
    });
}

main().catch(error => {
    report({
        type: 'complete',
        data: {
            status: 'fail',
            message: error.message,
            executionTime: timeSinceStart(),
        },
    });
});
