import path from 'path';
import fs from 'fs';

import { cloneBranch, createDownloadUrl } from '../git';

const REPO_PATH = path.join(__dirname, 'test-repo');

test('cloneBranch', async () => {
    await cloneBranch('https://github.com/IIIristraM/simple-hook-test.git', 'config', REPO_PATH);

    expect(fs.existsSync(`${REPO_PATH}/simple-hook-test/README.md`)).toBe(true);
});

test('createDownloadUrl', () => {
    expect(createDownloadUrl('https://github.com/IIIristraM/simple-hook-test.git', 'config', 'simple-hook.json')).toBe(
        `https://raw.github.com/IIIristraM/simple-hook-test/config/simple-hook.json`,
    );
});
