import {exec, ExecOptions} from 'child_process';

const MAX_BUFFER_SIZE = 5 * 1024 * 1024; // 5MB

export const runCommand = (command: string, options: ExecOptions = {}) => {
    const commandOptions = {
        maxBuffer: MAX_BUFFER_SIZE,
        execArgv: ['--max-old-space-size=4096'],
        ...options
    };

    return new Promise<string>((resolve, reject) => {
        const child = exec(command, commandOptions, (error, stdout, stderr) => {
            return error ? reject(error) : resolve(stdout);
        });

        child.stdout?.pipe(process.stdout);
        child.stderr?.pipe(process.stderr);
    });
};