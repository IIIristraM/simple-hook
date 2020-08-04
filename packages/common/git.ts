import { runCommand } from './shell';

export async function cloneBranch(gitUrl: string, branch: string, dest: string) {
    await runCommand(`
        rm -rf ${dest} &&
        mkdir -p ${dest} &&
        cd ${dest} &&
        git clone --depth 1 -b ${branch} --single-branch ${gitUrl}
    `);
}

export function createDownloadUrl(gitUrl: string, branch: string, file: string) {
    const [protocol, host, ...rest] = gitUrl.split('/').filter(Boolean);
    const name = rest.pop()?.split('.')?.[0] || '';
    return [`${protocol}/`, `raw.${host}`, ...rest, name, branch, file].join('/');
}
