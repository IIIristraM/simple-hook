import {v4} from 'uuid';

import { runCommand } from './common';
import { WebhookEvent } from '../types/webhook';

export const createBuildCommand = (
    ...[tag, config, args, cache]: [string, string, Record<string, string>, boolean]
) => {
    const buildCommandParts = [
        'docker build',
        cache ? null : '--no-cache',
        ...Object.entries(args).map(([key, value]) => (
            `--build-arg ${key}='${value}'`
        )),
        `--tag ${tag}`,
        `-f ${config}`,
        '.'
    ];

    return buildCommandParts.filter(Boolean).join(' ');
};

export function createRunImageCommand(...[tag]: [string]) {
    const buildCommandParts = [
        'docker run',
        '--rm',
        '-d',
        tag
    ];

    return buildCommandParts.filter(Boolean).join(' ');
}

export function createRemoveImageCommand(...[tag]: [string]) {
    const buildCommandParts = [
        'docker rmi',
        '-f',
        `${tag}:latest`
    ];

    return buildCommandParts.filter(Boolean).join(' ');
}

export async function buildBaseImage() {
    const buildCommand = createBuildCommand('simple-hook/base', './Dockerfile.base', {}, true);

    await runCommand(buildCommand, {
        env: process.env
    });
}

export async function buildInstanceImage(event: WebhookEvent) {
    const tag = [event.repository?.name, v4()].filter(Boolean).join('_');

    const buildCommand = createBuildCommand(tag, 'Dockerfile.instance', {
        EVENT: JSON.stringify(event)
    }, false);

    await runCommand(buildCommand, {
        env: process.env
    });

    return tag;
}

export async function runImage(tag: string): Promise<string> {
    const id = await runCommand(createRunImageCommand(tag), {
        env: process.env
    });

    return id.trim()
};

export async function removeImage(tag: string): Promise<string> {
    return await runCommand(createRemoveImageCommand(tag), {
        env: process.env
    });
};