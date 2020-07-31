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

export function createRunImageCommand(...[tag, event, port]: [string, WebhookEvent, number]) {
    return `docker run --rm -d ${tag} '${JSON.stringify(event)}' ${port}`;
}

export function createRemoveImageCommand(...[tag]: [string]) {
    return `docker rmi -f ${tag}:latest`;
}

export function createRemoveContainerCommand(containerId: string) {
    return `docker rm -f ${containerId}`;
}

export async function buildBaseImage() {
    const tag = 'simple-hook/base'
    const buildCommand = createBuildCommand(tag, './Dockerfile.base', {}, true);

    await runCommand(buildCommand, {
        env: process.env
    });

    return tag;
}

export async function runImage(tag: string, event: WebhookEvent, port: number): Promise<string> {
    const id = await runCommand(createRunImageCommand(tag, event, port), {
        env: process.env
    });

    return id.trim()
};

export async function removeImage(tag: string): Promise<string> {
    return await runCommand(createRemoveImageCommand(tag), {
        env: process.env
    });
};

export async function removeContainer(containerId: string): Promise<unknown> {
    return await runCommand(createRemoveContainerCommand(containerId), {
        env: process.env
    }).catch(err => {
        // если контейнер уже сам инициировал удаление
    });
};
