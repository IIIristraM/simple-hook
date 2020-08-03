import { runCommand } from '../common/shell';

export async function cloneBranch(gitUrl: string, branch: string, dest: string) {
    await runCommand(`
        rm -rf ${dest} &&
        mkdir -p ${dest} &&
        cd ${dest} &&
        git clone -b ${branch} --single-branch ${gitUrl}
    `);
}
