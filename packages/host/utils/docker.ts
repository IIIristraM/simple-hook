import { runCommand } from '../../common/shell';
import { ROOT } from '../consts';

export const createBuildCommand = (...[tag, args, cache]: [string, Record<string, string>, boolean]) => {
    const buildCommandParts = [
        'docker build',
        cache ? null : '--no-cache',
        ...Object.entries(args).map(([key, value]) => `--build-arg ${key}='${value}'`),
        `--tag ${tag}`,
        `-f ${ROOT}/Dockerfile`,
        ROOT,
    ];

    return buildCommandParts.filter(Boolean).join(' ');
};

export function createRunImageCommand(...[tag, data, port]: [string, unknown, number]) {
    return `docker run --rm -d ${tag} '${JSON.stringify(data)}' ${port}`;
}

export function createRemoveImageCommand(...[tag]: [string]) {
    return `docker rmi -f ${tag}:latest`;
}

export function createRemoveContainerCommand(containerId: string) {
    return `docker rm -f ${containerId}`;
}

export async function buildBaseImage() {
    const tag = 'simple-hook/base';
    const buildCommand = createBuildCommand(tag, {}, true);

    await runCommand(buildCommand, {
        env: process.env,
    });

    return tag;
}

export async function runImage(tag: string, data: unknown, port: number): Promise<string> {
    const id = await runCommand(createRunImageCommand(tag, data, port), {
        env: process.env,
    });

    return id.trim();
}

export async function removeImage(tag: string): Promise<string> {
    return await runCommand(createRemoveImageCommand(tag), {
        env: process.env,
    });
}

export async function removeContainer(containerId: string): Promise<unknown> {
    return await runCommand(createRemoveContainerCommand(containerId), {
        env: process.env,
    }).catch(err => {
        // если контейнер уже сам инициировал удаление
    });
}
